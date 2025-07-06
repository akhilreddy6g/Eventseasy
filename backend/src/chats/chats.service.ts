import { Injectable } from "@nestjs/common";
import { ChatBodyData, EventIdChatIdQueryParams, EventIdQueryParams, MessageBody, UserInfo} from "./dto/chats.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Viewer, ViewerDocument } from "src/events/eventdata/events.eventdata.schema";
import { LogInfoService } from "src/auth/logger/logger.service";
import { Chat, Chat_Messages, Chat_Restricted_User, Chat_Servers, ChatDocument } from "./chatdata/chats.chatdata.schema";
import { Producer } from "kafkajs";
import { kafka } from "src/kafka/kafka-client";
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto'; 
import { response } from "express";

@Injectable()
export class ChatsService {
    private producer: Producer
    private isConnected = false

    constructor(
    @InjectModel(Viewer.name) private viewerModel: Model<ViewerDocument>, 
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Chat_Restricted_User.name) private cruModel: Model<Chat_Restricted_User>,
    @InjectModel(Chat_Servers.name) private chatServersModel: Model<Chat_Servers>,
    @InjectModel(Chat_Messages.name) private chatMessagesModel: Model<Chat_Messages>,
    private logService: LogInfoService
    ){
      this.producer = kafka.producer()
    }

    computePartition(eventId: string, chatId: string, totalPartitions: number) {
      const compositeKey = `${eventId}-${chatId}`; 
      const hash = crypto.createHash("sha256").update(compositeKey).digest("hex"); 
      const intHash = parseInt(hash.slice(0, 8), 16); 
      return intHash % totalPartitions;
    }

    genUuid(){
      const id = uuidv4();
      return id
    }
    
    async onModuleDestroy() {
      if (this.isConnected) {
        await this.producer.disconnect()
      }
    }

    async findUserInEvent(user: string, eventId: string){
        try {
            const isUserExists = await this.viewerModel.find({user: user, eventId: eventId})
            if (isUserExists.length > 0){
                return {success: true, response: isUserExists, accType: isUserExists[0].accType}
            }
            return {success: false, response: "User doesn't exist in the event", accType: "none"}
        } catch (error) {
            return {success: false, response: error, accType: "none"}
        }
    }

    async startChat(query: EventIdChatIdQueryParams){
      try {
        const update = await this.chatModel.updateOne({eventId: query.eventId, _id: query.chatId}, {$set : {chatStatus: true}})
        this.logService.Logger({request: "Chat Activation Service", source: "chats service -> startChat", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Chat Activated Successfully", error: "none"})
        return {success: true, response: "Chat Activated successfully"}
      } catch (error) {
        this.logService.Logger({request: "Chat Activation Service", source: "chats service -> startChat", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Unable to Activate Chat", error: error})
        return {success: false, response: error}
      }
    }

    async getNewWsConn(data: EventIdChatIdQueryParams){
      try {
        const allSubs = await this.getAllSubscribers()
        const partition = this.computePartition(data.eventId, data.chatId, allSubs.response.length)
        if(allSubs.success && Array.isArray(allSubs.response) && allSubs.response.length > 0){
          const targetClient = allSubs.response.filter((item: {clientId: string, partition: number}) => item.partition === partition)
          const targetClientID = targetClient[0].clientId
          const targetServerApi = (await this.chatServersModel.findOne({csClientId: targetClientID})).csApiUrl
          this.logService.Logger({request: "Websocket Connection Service", source: "chats service -> getNewWsConn", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Successfully retrieved go server api url to establish websocket connection", error: "none"})
          return {success: true, response: targetServerApi}
        }
        return {success: false, response: "Unable to retrieve go server api url"}
      } catch (error) {
        this.logService.Logger({request: "Websocket Connection Service", source: "chats service -> getNewWsConn", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while getting go server api url", error: error})
        return {success: false, response: `Error while getting connection string: ${error.message}`}
      }
    }

    async fetchMsgs(query: EventIdChatIdQueryParams) {
      try {
        const result = await this.chatMessagesModel.aggregate([
          { $match: { eventId: query.eventId } },
          {
            $project: {
              _id: 0,
              messages: {
                $let: {
                  vars: {
                    matchedChat: {
                      $first: {
                        $filter: {
                          input: "$chats",
                          as: "chat",
                          cond: { $eq: ["$$chat.chatId", query.chatId] }
                        }
                      }
                    }
                  },
                  in: "$$matchedChat.messages"
                }
              }
            }
          }
        ]);
    
        if (result.length > 0 && result[0]?.messages) {
          this.logService.Logger({request: "Messages Fetch Service", source: "chats service -> fetchMsgs", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Messages fetched successfully", error: "none"})
          return { success: true, response: result[0].messages };
        }
    
        this.logService.Logger({request: "Messages Fetch Service", source: "chats service -> fetchMsgs", timestamp: new Date(), queryParams: true, bodyParams: false, response: "No messages found", error: "none"})
        return { success: true, response: "No messages found" };
      } catch (error) {
        this.logService.Logger({request: "Messages Fetch Service", source: "chats service -> fetchMsgs", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Error while fetching messages", error: error})
        return { success: false, response: error };
      }
    }
    
    async pushMsgToQueue(data: MessageBody){
      try {
          if (!this.isConnected) {
            await this.producer.connect()
            this.isConnected = true
          }
          data['messageId'] = this.genUuid()
          const ans = await this.producer.send({
            topic: 'cm-2',
            messages: [{ value: JSON.stringify(data), partition: this.computePartition(data.eventId, data.chatId, 6)}],
          })
          this.logService.Logger({request: "Message Push Service", source: "chats service -> pushMsgToQueue", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Message successfully pushed to the queue", error: "none"})
          return { success: true, response: data.messageId }
      } catch (error) {
        this.logService.Logger({request: "Message Push Service", source: "chats service -> pushMsgToQueue", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while pushing message to the queue", error: error})
        return { success: false, response: `Error while pushing message to the queue: ${error.message}` }
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
                return {success: true, response: "Successfully created the chat"}
            }
            this.logService.Logger({request: "Chat Creation Service", source: "chats service -> createChat", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Unable to create the chat - user doesn't have privileges", error: "none"})
            return {success: false, response: "Unable to create the chat - user doesn't have privileges"}
        } catch (error) {
            this.logService.Logger({request: "Chat Creation Service", source: "chats service -> createChat", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while creating the chat", error: error})
            return {success: false, response: error}
        }
    }

    async getAllSubscribers() {
      try {
        const admin = kafka.admin();
        await admin.connect();
        const { groups } = await admin.describeGroups(['cg-2']);
        const output = [];
    
        for (const group of groups) {
          for (const member of group.members) {
            const clientId = member.clientId; 
            const assignmentBuffer = Buffer.from(member.memberAssignment as any);
        
            const topicNameLength = (assignmentBuffer[6] << 8) | assignmentBuffer[7];
            const partitionsOffset = 8 + topicNameLength + 4;
        
            const numPartitions =
              (assignmentBuffer[partitionsOffset - 4] << 24) |
              (assignmentBuffer[partitionsOffset - 3] << 16) |
              (assignmentBuffer[partitionsOffset - 2] << 8) |
              assignmentBuffer[partitionsOffset - 1];
        
            for (let i = 0; i < numPartitions; i++) {
              const idx = partitionsOffset + i * 4;
              const partition =
                (assignmentBuffer[idx] << 24) |
                (assignmentBuffer[idx + 1] << 16) |
                (assignmentBuffer[idx + 2] << 8) |
                assignmentBuffer[idx + 3];
        
              output.push({
                clientId,   
                partition,
              });
            }
          }
        }        
        await admin.disconnect();
        this.logService.Logger({request: "Kafka Subscriber Info Service", source: "chats service -> getAllSubscribers", timestamp: new Date(), queryParams: false, bodyParams: false, response: "Successfully fetched info of all kafka consumers", error: "none"})
        return { success: true, response: output};
      } catch (error) {
        this.logService.Logger({request: "Kafka Subscriber Info Service", source: "chats service -> getAllSubscribers", timestamp: new Date(), queryParams: false, bodyParams: false, response: "Error while fetching kafka consumers info", error: error})
        return { success: false, response: `Error while fetching consumers: ${error.message}`};
      }
    }

    async getChats(query: EventIdQueryParams, eventUser: string){
        try {
            const userCheck = await this.findUserInEvent(eventUser, query.eventId)
            if(userCheck.success && userCheck.response.length > 0){
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
                    return {success: true, response: data}
                }
                this.logService.Logger({request: "Chat Info Retrieval Service", source: "chats service -> getChats", timestamp: new Date(), queryParams: false, bodyParams: true, response: "No chats found", error: "none"})
            }
            this.logService.Logger({request: "Chat Info Retrieval Service", source: "chats service -> getChats", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Failed to retrieve chats - user doesn't have privileges", error: "none"})
            return {success: false, response: "No chats found/ User doesn't have privileges"}
        } catch (error) {
            this.logService.Logger({request: "Chat Info Retrieval Service", source: "chats service -> getChats", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while retrieving the event chats", error: error})
            return {success: false, response: error}
        }
    }
}