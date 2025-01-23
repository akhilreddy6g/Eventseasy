import { Injectable } from "@nestjs/common";
import { LogInfoService } from "src/auth/logger/logger.service";
import { HostBodyData } from "./dto";
import { Event, EventDocument } from "./eventdata/events.eventdata.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class EventService{
    constructor(private logService: LogInfoService, @InjectModel(Event.name) private userModel: Model<EventDocument>){}
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

    manageEvent(){

    }

    attendEvent(){

    }

    async insertEvent(data: HostBodyData){
        try {
            const result = await this.userModel.insertMany([data])
            return result
        } catch (error) {
            this.logService.Logger({request: "Host Event Insertion Service", source: "events service -> insertEvent", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error inserting a host event", error: error})
            return null
        }
    }
}