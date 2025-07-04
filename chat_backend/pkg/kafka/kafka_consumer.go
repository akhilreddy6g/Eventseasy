package kafka

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

// func StartKafkaConsumer(pool *websocket.Pool, client string) {
// 	reader := kafka.NewReader(kafka.ReaderConfig{
// 		Dialer: &kafka.Dialer{
// 			ClientID: client,
// 		},
// 		Brokers:     []string{"localhost:9092"},
// 		Topic:       "cm-2",
// 		GroupID:     "cg-2",
// 	})

// 	// Initial connection test with timeout
// collection := mongodb.MongoClient.Database("test").Collection("chat_messages")
// ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
// defer cancel()

// 	_, err := reader.FetchMessage(ctx)
// 	if err != nil {
// 		log.Printf("🚫 Kafka not ready or unreachable: %v", err)
// 		if closeErr := reader.Close(); closeErr != nil {
// 			log.Printf("❌ Failed to close Kafka reader: %v", closeErr)
// 		}
// 		return // Exit gracefully — don’t block server
// 	}
// 	log.Println("✅ Kafka is reachable. Starting consumer...")

// 	// Resume full context and consumer loop
// 	ctx, cancel = context.WithCancel(context.Background())
// 	defer cancel()

// 	go handleShutdown(cancel)

// 	for {
// 		select {
// 		case <-ctx.Done():
// 			log.Println("🛑 Kafka consumer shutdown requested.")
// 			reader.Close()
// 			return
// 		default:
// 			msg, err := reader.ReadMessage(ctx)
// 			if err != nil {
// 				log.Printf("⚠️ Kafka read error: %v", err)
// 				time.Sleep(1 * time.Second) // basic retry delay
// 				continue
// 			}
// 			var wsMessage websocket.Body
// 			if err := json.Unmarshal(msg.Value, &wsMessage); err != nil {
// 				log.Printf("❌ Kafka message decode error: %v", err)
// 				continue
// 			}
// 			pool.Broadcast <- wsMessage
// 		}
// 	}
// }

// func handleShutdown(cancel context.CancelFunc) {
// 	c := make(chan os.Signal, 1)
// 	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)
// 	<-c
// 	log.Println("📴 Received shutdown signal...")
// 	cancel()
// }
