import { Injectable } from "@nestjs/common";
import { LogInfoService } from "src/auth/logger/logger.service";
import { HostBodyData, JoineeBodyData } from "./dto";
import { Attendant, AttendeeDocument, Event, EventDocument, Viewer, ViewerDocument } from "./eventdata/events.eventdata.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class EventService{

    constructor(
      private logService: LogInfoService, 
      @InjectModel(Event.name) private userModel: Model<EventDocument>, 
      @InjectModel(Attendant.name) private attendantModel: Model <AttendeeDocument>,
      @InjectModel(Viewer.name) private viewerModel: Model <ViewerDocument>
      ){}

    async hostEvent(data: HostBodyData){
      try {
        const result = await this.insertEvent(data);
        try {
          if (result.success){
            const result1 = await this.insertIntoViewers(data, result.message)
            if(result.success){
              this.logService.Logger({request: "Host Event Service", source: "events service -> hostEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Created an event and recorded it in viewers", error: "none"});
              return {success: true, message: "successfully created an event for the host"}
            } else {
              this.logService.Logger({request: "Host Event Service", source: "events service -> hostEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Created an event but couldn't record it in viewers", error: "none"});
              return {success: true, message: "Created the event for the host, but couldn't update viewers"}
            }
          } else {
            this.logService.Logger({request: "Host Event Service", source: "events service -> hostEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Failed to create an event for host", error: "none"});
            return {success: false, message: "Request failed, please enter all the required information"}
          }
        } catch (error) {
          this.logService.Logger({request: "Host Event Service", source: "events service -> hostEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while insering record into viewers", error: error});
          return {success: false, message: error}
        }
      } catch (error) {
        this.logService.Logger({request: "Host Event Service", source: "events service -> hostEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error creating an event for the host", error: error})
        return {success: false, message: error}
      }
    }

    async verifyJoinee(data: JoineeBodyData){
      try {
        const isExists = await this.attendantModel.find({user: data.user, access:false, entryCode:data.entryCode, accType:data.accType, eventId:data.eventId})
        if(isExists[0]){
          try {
            const update = await this.attendantModel.updateOne({user: data.user, entryCode:data.entryCode, accType:data.accType, eventId:data.eventId}, {$set : {access: true}})
            this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Attendant credentials verified and access granted", error: "none"})
            try {
              const result1 = await this.insertIntoViewers(data, data.eventId)
              if (result1.success){
                this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Successfully recorded the change in viewers", error: "none"})
                return {success: true, message: "Event joined successfully"};
              } else {
                this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Failed to record the change in viewers", error: "none"})
                return {success: true, message: "Event joined successfully, but couldn't record change in viewers"};
              }
            } catch (error) {
              this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while recording the change in viewers", error: error})
              return {success: false, message: "Event joined successfully, but faced errors while recording the change in viewers"};
            }
          } catch (error) {
            this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while verifying attendant credentials", error: error})
            return {success: false, message: "Error while trying to join the event"};
          }
        } else {
          this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Credentials unverifiable/ access already granted", error: "none"})
          return {success: false, message: "Event joined already/Invalid credentials"};
        }
      } catch (error) {
          this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while verifying joinee credentials", error: error})
          return {success: false, message: "Error while verifying joinee credentials"};
      }
    }

    async insertIntoViewers(data: HostBodyData | JoineeBodyData, eventId: string){
      try {
        const result = await this.viewerModel.insertMany({user: data.user, accType:data.accType, eventId:eventId, event:data.event})
        return {success: true, message: "Successfully inserted the event into viewers"}
      } catch (error) {
        this.logService.Logger({request: "Insert into Viewers Service", source: "events service -> insertIntoViewers", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while inserting the event into viewers", error: error})
        return {success: false, message: "Error while inserting the event into viewers"}
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

    async insertEvent(data: HostBodyData){
      try {
        const result = await this.userModel.insertMany([data])
        return {success: true, message: result[0]._id}
      } catch (error) {
        this.logService.Logger({request: "Host Event Insertion Service", source: "events service -> insertEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error inserting a host event", error: error})
        return {success: false, message: "Error inserting a host event"}
      }
    }
}