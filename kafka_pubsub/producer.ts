// producer.ts
import { kafka } from './kafka-client'

const producer = kafka.producer()

const run = async () => {
  await producer.connect()
  await producer.send({
    topic: 'chat-message',
    messages: [
      { value: 'Hello from KafkaJS!' },
      { value: 'Eventseasy says hi!' },
    ],
  })
  console.log('✅ Messages sent to chat-message topic!')
  await producer.disconnect()
}

run().catch(console.error)
