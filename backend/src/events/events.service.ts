import { Injectable } from "@nestjs/common";
import { LogInfoService } from "src/auth/logger/logger.service";
import { GetEventId, GetEventsQueryDto, HostBodyData, JoineeBodyData, ReinviteUser, UserDetails } from "./dto";
import { Attendant, AttendeeDocument, Event, EventDocument, Viewer, ViewerDocument } from "./eventdata/events.eventdata.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { RedisService } from "src/redis/redis.service";
import { InviteService } from "src/invite/invite.service";


@Injectable()
export class EventService{

    constructor(
      private logService: LogInfoService, 
      @InjectModel(Event.name) private userModel: Model<EventDocument>, 
      @InjectModel(Attendant.name) private attendantModel: Model <AttendeeDocument>,
      @InjectModel(Viewer.name) private viewerModel: Model <ViewerDocument>,
      private readonly redisService: RedisService,
      private readonly inviteService: InviteService
      ){}

    async hostEvent(data: HostBodyData){
      try {
        const result = await this.insertEvent(data);
        try {
          if (result.success){
            const result1 = await this.insertIntoViewers(data, result.response)
            if(result.success){
              this.logService.Logger({request: "Host Event Service", source: "events service -> hostEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Created an event and recorded it in viewers", error: "none"});
              return {success: true, response: "successfully created an event for the host"}
            } else {
              this.logService.Logger({request: "Host Event Service", source: "events service -> hostEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Created an event but couldn't record it in viewers", error: "none"});
              return {success: true, response: "Created the event for the host, but couldn't update viewers"}
            }
          } else {
            this.logService.Logger({request: "Host Event Service", source: "events service -> hostEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Failed to create an event for host", error: "none"});
            return {success: false, response: "Request failed, please enter all the required information"}
          }
        } catch (error) {
          this.logService.Logger({request: "Host Event Service", source: "events service -> hostEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while insering record into viewers", error: error});
          return {success: false, response: error}
        }
      } catch (error) {
        this.logService.Logger({request: "Host Event Service", source: "events service -> hostEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error creating an event for the host", error: error})
        return {success: false, response: error}
      }
    }

    async verifyJoinee(data: JoineeBodyData){
      try {
        const isExists = await this.attendantModel.find({user: data.user, access:false, accType:data.accType, eventId:data.eventId})
        if(isExists[0]){
          try {
            const update = await this.attendantModel.updateOne({user: data.user, accType:data.accType, eventId:data.eventId}, {$set : {access: true}})
            this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Attendant credentials verified and access granted", error: "none"})
            try {
              const result1 = await this.insertIntoViewers(data, data.eventId)
              if (result1.success){
                this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Successfully recorded the change in viewers", error: "none"})
                return {success: true, response: "Event joined successfully"};
              } else {
                this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Failed to record the change in viewers", error: "none"})
                return {success: false, response: "Event joined successfully, but couldn't record change in viewers"};
              }
            } catch (error) {
              this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while recording the change in viewers", error: error})
              return {success: false, response: "Event joined successfully, but faced errors while recording the change in viewers"};
            }
          } catch (error) {
            this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while verifying attendant credentials", error: error})
            return {success: false, response: "Error while trying to join the event"};
          }
        } else {
          this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Credentials unverifiable/ access already granted", error: "none"})
          return {success: false, response: "Event joined already/Invalid credentials"};
        }
      } catch (error) {
          this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while verifying joinee credentials", error: error})
          return {success: false, response: "Error while verifying joinee credentials"};
      }
    }

    async insertIntoViewers(data: HostBodyData | JoineeBodyData, eventId: Types.ObjectId){
      try {
        const result = await this.viewerModel.findOneAndUpdate(
          { user: data.user, accType: data.accType, eventId: eventId,},
          { $setOnInsert: { user: data.user, accType: data.accType, eventId: eventId,}},
          { upsert: true, new: true }
        );
        if (result) {
          return { success: true, response: result.createdAt ? "New viewer added successfully" : "Viewer already exists; no insertion needed", data: result,};
        } else {
          return { success: false, response: "Failed to insert or fetch the viewer"};
        }
      } catch (error) {
        this.logService.Logger({request: "Insert into Viewers Service", source: "events service -> insertIntoViewers", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while inserting the event into viewers", error: error})
        return {success: false, response: "Error while inserting the event into viewers"}
      }
    }

    joinEvent(data: JoineeBodyData){
      try {
        const result = this.verifyJoinee(data);
        return result;
      } catch (error) {
        this.logService.Logger({request: "Add Attendant Service", source: "events service -> joinEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while verifying the joinee", error: error})
        return null
      }
    }

    async eventGuests(data: GetEventId){
      try {
        const eventGuests = await this.attendantModel.find({eventId:data.eventId, accType:"Attend"})
        return {success: true, data:eventGuests}
      } catch (error) {
        this.logService.Logger({request: "Event Guests Info Service", source: "events service -> eventGuests", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Error fetching event guests", error: error})
        return {success: false, data: null}
      }
    }

    async eventManagers(data: GetEventId){
      try {
        const eventGuests = await this.attendantModel.find({eventId:data.eventId, accType:"Manage"})
        return {success: true, response:eventGuests}
      } catch (error) {
        this.logService.Logger({request: "Event Managers Info Service", source: "events service -> eventManagers", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Error fetching event managers", error: error})
        return {success: false, response: null}
      }
    }

    async insertEvent(data: HostBodyData){
      try {
        const result = await this.userModel.create([data])
        return {success: true, response: result[0]._id}
      } catch (error) {
        this.logService.Logger({request: "Host Event Insertion Service", source: "events service -> insertEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error inserting a host event", error: error})
        return {success: false, response: null}
      }
    }

    async deleteUserFromEvent(data: UserDetails, eventHost: string){
      try {
        const hostCheck = await this.userModel.find({user: eventHost, _id: data.eventId})
        if(hostCheck.length>0){
          const result = await this.attendantModel.deleteOne({user: data.user, eventId: data.eventId, accType: data.accType})
          const result1 = await this.viewerModel.deleteOne({user: data.user, eventId: data.eventId, accType: data.accType})
          if (result.deletedCount>0 && result1.deletedCount>0){
            return {success: true, response: "Succeessfully deleted the user from the event"}
          }
        }
        return {success: false, response: "Unable to delete the user from one of the documents/user doesn't have privileges"}
      } catch (error) {
        this.logService.Logger({request: "Event User Deletion Service", source: "events service -> deleteUserFromEvent", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Error removing the user from the event", error: error})
      }
    }

    async reInviteUser(data: ReinviteUser, eventHost: string){
      try {
        const hostCheck = await this.userModel.find({user: eventHost, _id: data.eventId})
        if(hostCheck.length>0){
          const response = await this.inviteService.sendEmail({username: data.username, user:data.user, hostName:data.hostName, eventId:data.eventId, accType:data.accType, access:data.access, eventName: hostCheck[0].event, message: data.message, flag:true})
          return response;
        }
        return {success: false, response: "Unable to reinvite the user/user doesn't have privileges"}
      } catch (error) {
        this.logService.Logger({request: "Reinvite User Service", source: "events service -> reInviteUser", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error reinviting the user to the event", error: error})
        return {success: false, response: "Error reinviting user to the event"}
      }
    }

    async userData(userdata: GetEventsQueryDto) { 
      try {
        const redisUserData = await this.redisService.get(userdata.user)
        if(redisUserData){
          const redisStatus = JSON.parse(redisUserData)?.["redisStatus"]
          const redisData = JSON.parse(redisUserData)?.["redisData"]
          if(redisStatus==userdata.status){
            if(redisData){
              this.logService.Logger({request: "User Data Retrieval Service", source: "events service -> userData", timestamp: new Date(), queryParams: true, bodyParams: false, response: "User data retrieval from redis successful", error: null})
              return {success: true, response: redisData}
            } 
          }
        }
        const data = await this.viewerModel.aggregate([
          {
            $match: {
              user: userdata.user, 
            },
          },
          {
            $lookup: {
              from: 'events', 
              let: { eventIdStr: '$eventId' }, 
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: [ 
                        '$_id', 
                        { $toObjectId: '$$eventIdStr' }, 
                      ],
                    },
                  },
                },
                {
                  $project: { event:1 }, 
                },
              ],
              as: 'eventData', 
            },
          },
        ]);
        this.redisService.set(userdata.user, {redisStatus:userdata.status, redisData:data, ttl: 15*60});
        this.logService.Logger({request: "User Data Retrieval Service", source: "users service -> userData", timestamp: new Date(), queryParams: true, bodyParams: false, response: "User data retrieval from db successful", error: null})
        return {success: true, response: data};
      } catch (error) {
        this.logService.Logger({request: "User Data Retrieval Service", source: "users service -> userData", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Error retrieving user data", error: error})
        return {success: false, response: null};
      }
    }

    async eventUsers(eventId: string) {
      try {
        const restrictedUsers = await this.attendantModel.find({eventId: eventId}, {user:1, userName:1, accType:1})
      this.logService.Logger({request: "Event Users Retrieval Service", source: "users service -> eventUsers", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Event users retrieved successfully", error: null})
        return {success: true, response: restrictedUsers}
      } catch (error) {
        this.logService.Logger({request: "eventUsers", source: "users service -> eventUsers", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Error retrieving event users", error: error})
        return {success: false, response: null};
      }
    }
}