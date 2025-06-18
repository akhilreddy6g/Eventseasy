package main

import (
	"context"
	"fmt"
	"log"

	"github.com/segmentio/kafka-go"
)

func main() {
	r := kafka.NewReader(kafka.ReaderConfig{
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
		fmt.Printf("Received message at offset %d: %s\n", msg.Offset, string(msg.Value))
	}
}
