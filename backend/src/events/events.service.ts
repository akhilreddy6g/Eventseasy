import { Injectable } from "@nestjs/common";
import { LogInfoService } from "src/auth/logger/logger.service";
import { HostBodyData, JoineeBodyData } from "./dto";
import { Attendant, AttendeeDocument, Event, EventDocument } from "./eventdata/events.eventdata.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class EventService{
    constructor(private logService: LogInfoService, @InjectModel(Event.name) private userModel: Model<EventDocument>, @InjectModel(Attendant.name) private attendantModel: Model <AttendeeDocument>){}
    async hostEvent(data: HostBodyData){
        try {
             const result = await this.insertEvent(data);
            if(result[0]){
              return {success: true, message: "successfully created an event for the host"}
            } else {
              this.logService.Logger({request: "Host Event Service", source: "events service -> hostEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Failed to create an event for host", error: "none"});
              return {success: false, message: "Request failed, please enter all the required information"}
            }
          } catch (error) {
            this.logService.Logger({request: "Host Event Service", source: "events service -> hostEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error creating an event for the host", error: error})
            return {success: false, message: error}
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
            return result
        } catch (error) {
            this.logService.Logger({request: "Host Event Insertion Service", source: "events service -> insertEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error inserting a host event", error: error})
            return {success: false, message: "Error inserting a host event"}
        }
    }

    async verifyJoinee(data: JoineeBodyData){
        try {
          const isExists = await this.attendantModel.find({user: data.user, access:false, entryCode:data.entryCode, accType:data.accType})
          if(isExists[0]){
            const update = await this.attendantModel.updateOne({user: data.user, entryCode:data.entryCode, accType:data.accType}, {$set : {access: true}})
            this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Attendant credentials verified and access granted", error: "none"})
            return {success: true, message: "Event joined successfully"};
          } else {
            this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Credentials unverifiable/ access already granted", error: "none"})
            return {success: false, message: "Event joined already/Invalid credentials"};
          }
        } catch (error) {
            this.logService.Logger({request: "Attendant Verification Service", source: "events service -> verifyJoinee", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while verifying joinee credentials", error: error})
            return {success: false, message: "Error while verifying joinee credentials"};
        }
    }
}