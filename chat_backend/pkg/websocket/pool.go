package websocket

import (
	"chat_server/pkg/models"
	"chat_server/pkg/mongodb"
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	// "go.mongodb.org/mongo-driver/mongo"
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

			timestamp, err := time.Parse(time.RFC3339, body.Timestamp)
			if err != nil {
				fmt.Println("❌ Invalid timestamp format:", err)
				continue
			}

			finalBody := FinalBody{
				EventId:   body.EventId,
				ChatId:    body.ChatId,
				MessageId: body.MessageId,
				User:      body.User,
				Username:  body.Username,
				Message:   body.Message,
				Timestamp: body.Timestamp,
			}

			// Broadcast to other users
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

			collection := mongodb.MongoClient.Database("test").Collection("chat_messages")
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			msg := models.Message{
				MessageID: body.MessageId,
				Username:  body.Username,
				User:      body.User,
				Message:   body.Message,
				Timestamp: timestamp,
			}

			// 1. Try to push into existing chat
			filter := bson.M{"eventId": body.EventId, "chats.chatId": body.ChatId}
			update := bson.M{
				"$push": bson.M{
					"chats.$.messages": msg,
				},
			}
			result, err := collection.UpdateOne(ctx, filter, update)

			if err != nil {
				fmt.Println("❌ DB update error:", err)
			} else if result.MatchedCount == 0 {
				// 2. Chat not found: try to push a new chat to existing event
				filter = bson.M{"eventId": body.EventId}
				update = bson.M{
					"$push": bson.M{
						"chats": models.Chat{
							ChatID:   body.ChatId,
							Messages: []models.Message{msg},
						},
					},
				}
				result, err = collection.UpdateOne(ctx, filter, update)
				if err != nil {
					fmt.Println("❌ Error adding new chat to existing event:", err)
				} else if result.MatchedCount == 0 {
					// 3. Event not found: create new event with chat
					newEvent := models.Event{
						EventID: body.EventId,
						Chats: []models.Chat{
							{
								ChatID:   body.ChatId,
								Messages: []models.Message{msg},
							},
						},
					}
					_, err = collection.InsertOne(ctx, newEvent)
					if err != nil {
						fmt.Println("❌ Error inserting new event:", err)
					} else {
						fmt.Println("✅ New event inserted")
					}
				} else {
					fmt.Println("✅ New chat added to existing event")
				}
			} else {
				fmt.Println("✅ Message appended to existing chat")
			}
		}
	}
}
