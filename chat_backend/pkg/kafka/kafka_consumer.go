package kafka

import (
	"chat_server/pkg/websocket"
	"context"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/segmentio/kafka-go"
	"github.com/segmentio/kafka-go/sasl/scram"
)

func StartKafkaConsumer(pool *websocket.Pool, client string) {
	// Load .env only for local dev; Render/prod should use platform env vars
	_ = godotenv.Load()

	// --- Required env vars ---
	brokers := os.Getenv("KAFKA_CLIENT_URL")
	if brokers == "" {
		log.Fatal("KAFKA_CLIENT_URL is missing (Environment Variables not set or wrong key)")
	}
	brokerList := strings.Split(brokers, ",")

	topic := os.Getenv("KAFKA_TOPIC_NAME")
	if topic == "" {
		log.Fatal("KAFKA_TOPIC_NAME is missing")
	}

	groupId := os.Getenv("KAFKA_CONSUMER_GROUP_ID")
	if groupId == "" {
		log.Fatal("KAFKA_CONSUMER_GROUP_ID is missing")
	}

	caPEM := os.Getenv("KAFKA_CLIENT_CA_CERT")
	if caPEM == "" {
		log.Fatal("KAFKA_CLIENT_CA_CERT is missing")
	}
	roots := x509.NewCertPool()
	if !roots.AppendCertsFromPEM([]byte(caPEM)) {
		log.Fatal("failed to parse KAFKA_CLIENT_CA_CERT")
	}

	user := os.Getenv("KAFKA_USERNAME")
	pass := os.Getenv("KAFKA_PASSWORD")
	if user == "" || pass == "" {
		log.Fatal("KAFKA_USERNAME or KAFKA_PASSWORD is missing")
	}

	// If your cluster uses SCRAM-SHA-512, change scram.SHA256 -> scram.SHA512
	mech, err := scram.Mechanism(scram.SHA256, user, pass)
	if err != nil {
		log.Fatal(err)
	}

	var dialer *kafka.Dialer

	if os.Getenv("NODE_ENV") == "production" {
		dialer = &kafka.Dialer{
			ClientID: client,
			TLS: &tls.Config{
				RootCAs:    roots,
				MinVersion: tls.VersionTLS12,
			},
			SASLMechanism: mech,
		}
	} else {
		dialer = &kafka.Dialer{
			ClientID: client,
		}
	}

	r := kafka.NewReader(kafka.ReaderConfig{
		Dialer:  dialer,
		Brokers: brokerList,
		Topic:   topic,
		GroupID: groupId,
	})

	defer func() {
		_ = r.Close()
	}()

	fmt.Println("👂 Listening for messages...")

	for {
		msg, err := r.ReadMessage(context.Background())
		if err != nil {
			log.Fatalf("error while reading: %v", err)
		}

		var wsMessage websocket.Body
		if err := json.Unmarshal(msg.Value, &wsMessage); err != nil {
			fmt.Println("❌ Failed to parse Kafka message:", err)
			continue
		}
		pool.Broadcast <- wsMessage
	}
}
