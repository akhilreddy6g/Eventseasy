import 'dotenv/config'
import { Kafka } from 'kafkajs'

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [ process.env.KAFKA_CLIENT_URL!],
  ssl: process.env.NODE_ENV === 'production' && {
    ca: [process.env.KAFKA_CLIENT_CA_CERT!],
    cert: process.env.KAFKA_ACCESS_CERT!,
    key: process.env.KAFKA_ACCESS_KEY!,
  }
})