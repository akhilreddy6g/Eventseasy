package websocket

import (
	"fmt"
)

type Pool struct {
	Register   chan *Client
	Unregister chan *Client
	Clients    map[string]*Client
	Broadcast  chan Body
}

type FinalBody struct {
	EventId   string `json:"eventId"`
	ChatId    string `json:"chatId"`
	MessageId string `json:"messageId"`
	User      string `json:"user"`
	Username  string `json:"username"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
}

func NewPool() *Pool {
	return &Pool{
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Clients:    make(map[string]*Client),
		Broadcast:  make(chan Body),
	}
}

func getClientKey(eventId, chatId, user string) string {
	return fmt.Sprintf("%s:%s:%s", eventId, chatId, user)
}

func (pool *Pool) Start() {
	for {
		select {
		case client := <-pool.Register:
			key := getClientKey(client.EventId, client.ChatId, client.User)
			if existingClient, exists := pool.Clients[key]; exists {
				existingClient.mu.Lock()
				existingClient.Conn.Close()
				existingClient.Conn = client.Conn
				existingClient.mu.Unlock()
				fmt.Println("🔁 Replaced existing client connection")
			} else {
				pool.Clients[key] = client
				fmt.Println("➕ New client added")
			}
			fmt.Println("👥 Total clients in pool:", len(pool.Clients))
		case client := <-pool.Unregister:
			key := getClientKey(client.EventId, client.ChatId, client.User)
			if _, exists := pool.Clients[key]; exists {
				delete(pool.Clients, key)
				client.Conn.Close()
				fmt.Println("❌ Client unregistered:", key)
			} else {
				fmt.Println("⚠️ Client not found during unregister:", key)
			}
			fmt.Println("👥 Total clients in pool:", len(pool.Clients))
		case body := <-pool.Broadcast:
			fmt.Println("📢 Broadcasting:", body)
			finalBody := FinalBody{
				EventId:   body.EventId,
				ChatId:    body.ChatId,
				MessageId: body.MessageId,
				User:      body.User,
				Username:  body.Username,
				Message:   body.Message,
				Timestamp: body.Timestamp,
			}
			for key, client := range pool.Clients {
				if client.EventId == body.EventId && client.ChatId == body.ChatId && client.User != body.User {
					client.mu.Lock()
					err := client.Conn.WriteJSON(finalBody)
					client.mu.Unlock()
					if err != nil {
						fmt.Println("❌ Error sending:", err)
						delete(pool.Clients, key)
					}
				}
			}
		}
	}
}
