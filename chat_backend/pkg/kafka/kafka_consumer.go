package kafka_consumer

import (
	"chat_server/pkg/websocket"
	"context"
	"fmt"
	"log"

	"github.com/segmentio/kafka-go"
)

func StartKafkaConsumer(pool *websocket.Pool, client string) {
	r := kafka.NewReader(kafka.ReaderConfig{
		Dialer: &kafka.Dialer{
			ClientID: client,
		},
		Brokers: []string{"localhost:9092"},
		Topic:   "chat-message",
		GroupID: "go-consumer-group",
	})

	fmt.Println("👂 Listening for messages...")

	for {
		msg, err := r.ReadMessage(context.Background())
		if err != nil {
			log.Fatalf("error while reading: %v", err)
		}
		message := fmt.Sprintf("Kafka -> offset: %d, value: %s", msg.Offset, string(msg.Value))
		fmt.Println("📨 Broadcasting:", message)
	}
}
