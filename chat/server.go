package main

import (
	"chat_server/pkg/config"
	"chat_server/pkg/kafka"
	"chat_server/pkg/mongodb"
	"chat_server/pkg/websocket"
	"context"
	"flag"
	"fmt"
	"net/http"
	"os"
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

func runCronHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("run-cron endpoint hit")

	// Only allow POST
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	reqApiKey := os.Getenv("CRON_JOB_API_KEY")
	apiKey := r.Header.Get("api-key")

	if reqApiKey == "" || apiKey == "" || reqApiKey != apiKey {
		fmt.Println("❌ No / wrong API key provided")
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	fmt.Println("✅ Successfully activated the server")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"message":"Server activated successfully"}`))
}

func main() {
	fmt.Println("Go's server started.")
	config.LoadEnv()
	mongoClient := mongodb.InitMongoDB()
	defer func() {
		if err := mongoClient.Disconnect(context.Background()); err != nil {
			fmt.Println("❌ MongoDB disconnect error:", err)
		}
	}()
	port := flag.String("port", os.Getenv("PORT"), "Port to run the WebSocket server on")
	clientID := flag.String("clientid", os.Getenv("SERVER_CLIENT_ID"), "Client ID to use when connecting to Kafka")
	flag.Parse() // Parse command-line flags

	pool := websocket.NewPool()
	go pool.Start()

	// Start Kafka consumer and pass WebSocket pool
	go kafka.StartKafkaConsumer(pool, *clientID)

	// Setup HTTP routes
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWS(pool, w, r)
	})

	http.HandleFunc("/awake", runCronHandler)

	http.ListenAndServe("0.0.0.0:"+*port, nil)
}
