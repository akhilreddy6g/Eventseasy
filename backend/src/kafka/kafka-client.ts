import 'dotenv/config'
import { Kafka } from 'kafkajs'

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID ?? 'my-app',
  brokers: [ process.env.KAFKA_CLIENT_URL! ?? 'localhost:9092'],
  ssl: {
    ca: [process.env.KAFKA_CLIENT_CA_CERT!],
    cert: process.env.KAFKA_ACCESS_CERT!,
    key: process.env.KAFKA_ACCESS_KEY!,
  }
})