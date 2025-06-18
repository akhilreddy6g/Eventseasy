// consumer.ts
import { kafka } from './kafka-client' // ✅ make sure you're importing from the new kafka.ts

const consumer = kafka.consumer({ groupId: 'eventseasy-group2' })

const run = async () => {
  console.log('🔌 Connecting consumer...')
  await consumer.connect()

  console.log('📬 Subscribing to topic...')
  await consumer.subscribe({ topic: 'chat-message', fromBeginning: true })

  console.log('👂 Listening for messages...')
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        topic,
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      })
    },
  })
}

run().catch((e) => {
  console.error('❌ Error in consumer:', e)
})