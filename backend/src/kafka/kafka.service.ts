// backend/src/kafka/kafka.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common'
import { kafka } from './kafka-client'

@Injectable()
export class KafkaService implements OnModuleInit {
  async onModuleInit() {
    await this.createKafkaTopic()
  }

  private async createKafkaTopic() {
    const admin = kafka.admin()

    try {
      console.log('Connecting to Kafka admin...')
      await admin.connect()

      console.log('Creating topic...')
      const result = await admin.createTopics({
        topics: [
          {
            topic: 'chat-message',
            numPartitions: 6,
            replicationFactor: 1,
          },
        ],
      })

      if (result) {
        console.log('✅ Topic "chat-message" created successfully with 6 partitions.')
      } else {
        console.log('ℹ️ Topic "chat-message" already exists. No changes made.')
      }
    } catch (error) {
      console.error('❌ Error creating topic:', error)
    } finally {
      await admin.disconnect()
      console.log('Disconnected from Kafka admin.')
    }
  }
}
