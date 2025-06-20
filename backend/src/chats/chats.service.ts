import { Injectable } from "@nestjs/common";
import { ChatBodyData, ChatStartQueryParams, EventInfoQueryParams, UserInfo} from "./dto/chats.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Viewer, ViewerDocument } from "src/events/eventdata/events.eventdata.schema";
import { LogInfoService } from "src/auth/logger/logger.service";
import { Chat, Chat_Restricted_User, ChatDocument } from "./chatdata/chats.chatdata.schema";

@Injectable()
export class ChatsService {
    constructor(
    @InjectModel(Viewer.name) private viewerModel: Model<ViewerDocument>, 
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Chat_Restricted_User.name) private cruModel: Model<Chat_Restricted_User>,
    private logService: LogInfoService
    ){}

    async findUserInEvent(user: string, eventId: string){
        try {
            const isUserExists = await this.viewerModel.find({user: user, eventId: eventId})
            if (isUserExists.length > 0){
                return {success: true, message: isUserExists, accType: isUserExists[0].accType}
            }
            return {success: false, message: "User doesn't exist in the event", accType: "none"}
        } catch (error) {
            return {success: false, message: error, accType: "none"}
        }
    }
    async createChat(data: ChatBodyData, eventUser: string) {
        try {
            const userCheck = await this.findUserInEvent(eventUser, data.eventId)
            if(userCheck.success){
                const id = (await this.chatModel.create(data))._id
                const recordsToInsert = data.restrictedUsers.map((user: string | UserInfo) => ({
                  eventId: data.eventId,
                  chatId: id,
                  user: user,
                }));                
                const updateRestrictedUserResponse = await this.cruModel.insertMany(recordsToInsert);
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

    async getChats(query: EventInfoQueryParams, eventUser: string){
        try {
            const userCheck = await this.findUserInEvent(eventUser, query.eventId)
            if(userCheck.success && userCheck.message.length > 0){
                const accType = userCheck.accType
                this.logService.Logger({request: "Chat Info Retrieval Service", source: "chats service -> getChats", timestamp: new Date(), queryParams: true, bodyParams: false, response: "User verified successfully", error: "none"})
                const data = await this.chatModel.aggregate([
                  {
                    $match: { eventId: query.eventId }
                  },
                  {
                    $lookup: {
                      from: "chat_restricted_users",
                      let: { chatId: { $toString: '$_id' }, user: eventUser },
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
                    $match: {
                      matchingRecords: { $eq: [] }
                    }
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
                      restrictedUsers: {
                        $cond: {
                          if: { $in: [accType, ["Host", "Manage"]] },
                          then: "$restrictedUsers",
                          else: "$$REMOVE" 
                        }
                      }
                    }
                  }
                ])
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

    async startChat(query: ChatStartQueryParams){
      try {
        const update = await this.chatModel.updateOne({eventId: query.eventId, _id: query.chatId}, {$set : {chatStatus: true}})
        console.log("update", update)
        this.logService.Logger({request: "Chat Activation Service", source: "chats service -> startChat", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Chat Activated Successfully", error: "none"})
        return {success: true, message: "Chat Activated successfully"}
      } catch (error) {
        this.logService.Logger({request: "Chat Activation Service", source: "chats service -> startChat", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Unable to Activate Chat", error: error})
        return {success: false, message: error}
      }
    }
}