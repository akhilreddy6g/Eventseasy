import { Injectable } from "@nestjs/common";
import { ChatBodyData, ChatQueryData } from "./dto/chats.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Viewer, ViewerDocument } from "src/events/eventdata/events.eventdata.schema";
import { LogInfoService } from "src/auth/logger/logger.service";
import { Chat, ChatDocument } from "./chatdata/chats.chatdata.schema";

@Injectable()
export class ChatsService {
    constructor(
    @InjectModel(Viewer.name) private viewerModel: Model<ViewerDocument>, 
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    private logService: LogInfoService
    ){}

    async findUserInEvent(user: string, eventId: string){
        try {
            const isUserExists = await this.viewerModel.find({user: user, eventId: eventId})
            if (isUserExists.length > 0){
                return {success: true, message: isUserExists}
            }
            return {success: false, message: "User doesn't exist in the event"}
        } catch (error) {
            return {success: false, message: error}
        }
    }
    async createChat(data: ChatBodyData, eventUser: string) {
        try {
            const userCheck = await this.findUserInEvent(eventUser, data.eventId)
            if(userCheck.success){
                const response = await this.chatModel.create(data)
                this.logService.Logger({request: "Chat Creation Service", source: "chats service -> createChat", timestamp: new Date(), queryParams: false, bodyParams: true, response: "User verified, and new chat created successfully", error: "none"})
                return {success: true, message: "Successfully created the chat"}
            }
            this.logService.Logger({request: "Chat Creation Service", source: "chats service -> createChat", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Unable to create the chat - user doesn't have privileges", error: "none"})
            return {success: false, message: "Unable to create the chat - user doesn't have privileges"}
        } catch (error) {
            this.logService.Logger({request: "Chat Creation Service", source: "chats service -> createChat", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while creating the chat", error: error})
            return {success: false, message: error}
        }
    }

    async getChats(query: ChatQueryData, eventUser: string){
        try {
            const userCheck = await this.findUserInEvent(eventUser, query.eventId)
            if(userCheck.success && userCheck.message.length > 0){
                this.logService.Logger({request: "Chat Info Retrieval Service", source: "chats service -> getChats", timestamp: new Date(), queryParams: true, bodyParams: false, response: "User verified successfully", error: "none"})
                const data = await this.chatModel.aggregate([
                    { 
                      $match: { eventId: query.eventId } 
                    },
                    {
                      $lookup: {
                        from: "event_chat_sessions",
                        let: { chatId: {$toString:'$_id'}, user: eventUser }, 
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $and: [
                                  { $eq: ["$chatId", "$$chatId"] }, 
                                  { $eq: ["$user", "$$user"] }   
                                ]
                              }
                            }
                          }
                        ],
                        as: "matchingRecords"
                      }
                    },
                    {
                      $set: {
                        userInChat: { $gt: [{ $size: "$matchingRecords" }, 0] } 
                      }
                    },{
                      $unset: "matchingRecords" 
                    },
                    {
                      $project: {
                        _id: false,
                        chatId: "$_id", 
                        chatName: true,
                        chatDescription: true,
                        chatType: true,
                        chatDate: true,
                        chatStartTime: true,
                        chatEndTime: true,
                        chatStatus: true,
                        restrictedUsers: true,
                        userInChat: true,  
                      }
                    }
                  ]);
                if(data.length>0){
                    return {success: true, message: data}
                }
                this.logService.Logger({request: "Chat Info Retrieval Service", source: "chats service -> getChats", timestamp: new Date(), queryParams: false, bodyParams: true, response: "No chats found", error: "none"})
            }
            this.logService.Logger({request: "Chat Info Retrieval Service", source: "chats service -> getChats", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Failed to retrieve chats - user doesn't have privileges", error: "none"})
            return {success: false, message: "No chats found/ User doesn't have privileges"}
        } catch (error) {
            this.logService.Logger({request: "Chat Info Retrieval Service", source: "chats service -> getChats", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while retrieving the event chats", error: error})
            return {success: false, message: error}
        }
    }
}