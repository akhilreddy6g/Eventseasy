// consumer.ts
import { kafka } from './kafka-client'

const consumer = kafka.consumer({ groupId: 'eventseasy-group' })

const run = async () => {
  await consumer.connect()
  await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      })
    },
  })
}

run().catch(console.error)
