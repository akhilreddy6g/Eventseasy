import { Injectable } from "@nestjs/common";
import { MessageBody, NewWsConnBody } from "./dto/message.dto";
import { LogInfoService } from "src/auth/logger/logger.service";
import { kafka } from "src/kafka/kafka-client";
import { Producer } from 'kafkajs'

@Injectable()
export class MessageService {
    private producer: Producer
    private isConnected = false

    constructor(private logService: LogInfoService) {
        this.producer = kafka.producer()
    }

    async getNewWsConn(data: NewWsConnBody){
    }

    async pushMsgToQueue(data: MessageBody){
        try {
            if (!this.isConnected) {
              await this.producer.connect()
              this.isConnected = true
            }
            await this.producer.send({
              topic: 'chat-message',
              messages: [{ value: JSON.stringify(data) }],
            })
            return { success: true, message: 'Message pushed successfully to the queue' }
        } catch (error) {
            return { success: false, message: `Error while pushing message to the queue: ${error.message}` }
        }
    }

    async getAllSubscribers() {
        try {
          const admin = kafka.admin()
          await admin.connect()
          const { groups } = await admin.describeGroups(['go-consumer-group'])
    
          const output = []
    
          // Retrieving partitions and server url   
          for (const group of groups) {
            for (const member of group.members) {
              const clientHost = member.clientHost // This is the IP/server
              const assignmentBuffer = Buffer.from(member.memberAssignment as any)
    
              // Topic name length is at byte index 6–7
              const topicNameLength = (assignmentBuffer[6] << 8) | assignmentBuffer[7]
    
              // Partitions start after topic name and a 4-byte skip
              const partitionsOffset = 8 + topicNameLength + 4
              const numPartitions =
                (assignmentBuffer[partitionsOffset - 4] << 24) |
                (assignmentBuffer[partitionsOffset - 3] << 16) |
                (assignmentBuffer[partitionsOffset - 2] << 8) |
                assignmentBuffer[partitionsOffset - 1]
    
              const partitions = []
              for (let i = 0; i < numPartitions; i++) {
                const idx = partitionsOffset + i * 4
                const partition =
                  (assignmentBuffer[idx] << 24) |
                  (assignmentBuffer[idx + 1] << 16) |
                  (assignmentBuffer[idx + 2] << 8) |
                  assignmentBuffer[idx + 3]
                partitions.push(partition)
              }
    
              output.push({
                server: clientHost.replace('/', ''), // Remove leading slash
                partitions,
              })
            }
          }
    
          await admin.disconnect()
          return {
            success: true,
            message: 'Active Kafka consumers and their partitions',
            output,
          }
        } catch (error) {
          return {
            success: false,
            message: `Error while fetching consumers: ${error.message}`,
          }
        }
      }

    async onModuleDestroy() {
        if (this.isConnected) {
          await this.producer.disconnect()
        }
      }
}