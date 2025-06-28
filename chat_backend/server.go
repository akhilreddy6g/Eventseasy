package main

import (
	kafka_consumer "chat_server/pkg/kafka"
	"chat_server/pkg/websocket"
	"flag"
	"fmt"
	"net/http"
)

func serveWS(pool *websocket.Pool, w http.ResponseWriter, r *http.Request) {
	fmt.Println("websocket endpoint reached")
	conn, err := websocket.Upgrade(w, r)
	if err != nil {
		fmt.Println("Read err:", err)
	}

	eventId := r.URL.Query().Get("eventId")
	chatId := r.URL.Query().Get("chatId")
	user := r.URL.Query().Get("user")

	fmt.Println("eventId:", eventId)
	fmt.Println("chatId:", chatId)
	fmt.Println("user:", user)

	client := &websocket.Client{
		EventId: eventId,
		ChatId:  chatId,
		User:    user,
		Conn:    conn,
		Pool:    pool,
	}

	pool.Register <- client
}

func main() {
	fmt.Println("Go's server started.")
	port := flag.String("port", "4001", "Port to run the WebSocket server on")
	clientID := flag.String("clientid", "go-api-server", "Client ID to use when connecting to Kafka")
	flag.Parse() // Parse command-line flags

	pool := websocket.NewPool()
	go pool.Start()

	// Start Kafka consumer and pass WebSocket pool
	go kafka_consumer.StartKafkaConsumer(pool, *clientID)

	// Setup HTTP routes
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWS(pool, w, r)
	})

	http.ListenAndServe("0.0.0.0:"+*port, nil)
}
