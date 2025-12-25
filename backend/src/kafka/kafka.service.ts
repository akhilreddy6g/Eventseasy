import 'dotenv/config'
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
            topic: process.env.KAFKA_TOPIC_NAME ?? 'cm-2',
            numPartitions: Number(process.env.KAFKA_TOPIC_PARTITIONS ?? 6),
            replicationFactor: 1,
          },
        ],
      })

      if (result) {
        this.logService.Logger({request: "Kafka Topic Creation Service", source: "kafka service -> createKafkaTopic", timestamp: new Date(), queryParams: false, bodyParams: false, response: "Topic created successfully with 6 partitions", error: "none"})
      } else {
        this.logService.Logger({request: "Kafka Topic Creation Service", source: "kafka service -> createKafkaTopic", timestamp: new Date(), queryParams: false, bodyParams: false, response: "Topic already exists. No changes made", error: "none"})
      }
    } catch (error: any) {
      const details = {
        name: error?.name,
        message: error?.message,
        type: error?.type,
        code: error?.code,
        retriable: error?.retriable,
        innerErrors: error?.errors?.map((e: any) => ({
          name: e?.name,
          message: e?.message,
          type: e?.type,
          code: e?.code,
          retriable: e?.retriable,
          help: e?.help,
        })),
      };
    
      this.logService.Logger({
        request: "Kafka Topic Creation Service",
        source: "kafka service -> createKafkaTopic",
        timestamp: new Date(),
        queryParams: false,
        bodyParams: false,
        response: "Error creating topic",
        error: JSON.stringify(details),
      });
    }
     finally {
      await admin.disconnect()
    }
  }
}
