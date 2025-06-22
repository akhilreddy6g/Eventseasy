import { Injectable } from "@nestjs/common";
import { MessageBody, NewWsConnBody } from "./dto/message.dto";
import { LogInfoService } from "src/auth/logger/logger.service";
import { kafka } from "src/kafka/kafka-client";
import { Producer } from 'kafkajs'
import * as crypto from 'crypto'; 
import { InjectModel } from "@nestjs/mongoose";
import { Chat_Servers } from "./messagedata/message.eventdata.schema";
import { Model } from "mongoose";

@Injectable()
export class MessageService {
    private producer: Producer
    private isConnected = false

    constructor(private logService: LogInfoService, 
      @InjectModel(Chat_Servers.name) private chatServersModel: Model<Chat_Servers>
    ) {
        this.producer = kafka.producer()
    }

    computePartition(eventId: string, chatId: string, totalPartitions: number) {
      const compositeKey = `${eventId}-${chatId}`; 
      const hash = crypto.createHash("sha256").update(compositeKey).digest("hex"); 
      const intHash = parseInt(hash.slice(0, 8), 16); 
      return intHash % totalPartitions;
    }

    async getNewWsConn(data: NewWsConnBody){
       try {
          const allSubs = await this.getAllSubscribers()
          const partition = this.computePartition(data.eventId, data.chatId, allSubs.output.length)
          const targetClientID = allSubs.output.filter((item: {clientId: string, partition: number}) => item.partition === partition)[0].clientId
          const targetServerApi = (await this.chatServersModel.findOne({csClientId: targetClientID})).csApiUrl
          return {success: true, data: targetServerApi}
       } catch (error) {
          return {success: false, message: `Error while getting connection string: ${error.message}`}
       }
    }

    async pushMsgToQueue(data: MessageBody){
        try {
            if (!this.isConnected) {
              await this.producer.connect()
              this.isConnected = true
            }
            await this.producer.send({
              topic: 'chat-message',
              messages: [{ value: JSON.stringify(data), partition: this.computePartition(data.eventId, data.chatId, 6)}],
            })
            return { success: true, message: 'Message pushed successfully to the queue' }
        } catch (error) {
            return { success: false, message: `Error while pushing message to the queue: ${error.message}` }
        }
    }

    async getAllSubscribers() {
      try {
        const admin = kafka.admin();
        await admin.connect();
        const { groups } = await admin.describeGroups(['go-consumer-group']);
    
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
        return {
          success: true,
          message: 'Active Kafka consumers and their partitions',
          output,
        };
      } catch (error) {
        return {
          success: false,
          message: `Error while fetching consumers: ${error.message}`,
        };
      }
    }
    
    async onModuleDestroy() {
        if (this.isConnected) {
          await this.producer.disconnect()
        }
      }
}