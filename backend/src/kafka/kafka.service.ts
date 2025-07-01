// backend/src/kafka/kafka.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common'
import { kafka } from './kafka-client'
import { LogInfoService } from 'src/auth/logger/logger.service'

@Injectable()
export class KafkaService implements OnModuleInit {
  constructor(
    private logService: LogInfoService
  ){}
  async onModuleInit() {
    await this.createKafkaTopic()
  }

  private async createKafkaTopic() {
    const admin = kafka.admin()
    try {
      await admin.connect()
      const result = await admin.createTopics({
        topics: [
          {
            topic: 'cm-2',
            numPartitions: 6,
            replicationFactor: 1,
          },
        ],
      })

      if (result) {
        this.logService.Logger({request: "Kafka Topic Creation Service", source: "kafka service -> createKafkaTopic", timestamp: new Date(), queryParams: false, bodyParams: false, response: "Topic created successfully with 6 partitions", error: "none"})
      } else {
        this.logService.Logger({request: "Kafka Topic Creation Service", source: "kafka service -> createKafkaTopic", timestamp: new Date(), queryParams: false, bodyParams: false, response: "Topic already exists. No changes made", error: "none"})
      }
    } catch (error) {
      this.logService.Logger({request: "Kafka Topic Creation Service", source: "kafka service -> createKafkaTopic", timestamp: new Date(), queryParams: false, bodyParams: false, response: "Error creating topic", error: error})
    } finally {
      await admin.disconnect()
    }
  }
}
