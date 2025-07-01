package kafka_consumer

import (
	"chat_server/pkg/websocket"
	"context"
	"encoding/json"
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
		Topic:   "cm-2",
		GroupID: "cg-2",
	})

	fmt.Println("👂 Listening for messages...")

	for {
		msg, err := r.ReadMessage(context.Background())
		if err != nil {
			log.Fatalf("error while reading: %v", err)
		}
		// 🔄 Deserialize Kafka message into WebSocket message
		var wsMessage websocket.Body
		if err := json.Unmarshal(msg.Value, &wsMessage); err != nil {
			fmt.Println("❌ Failed to parse Kafka message:", err)
			continue
		}
		pool.Broadcast <- wsMessage
	}
}
