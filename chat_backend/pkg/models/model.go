package models

import "time"

type Message struct {
	MessageID string    `bson:"messageId" json:"messageId"`
	Username  string    `bson:"username" json:"username"`
	User      string    `bson:"user" json:"user"`
	Message   string    `bson:"message" json:"message"`
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
}

type Chat struct {
	ChatID   string    `bson:"chatId" json:"chatId"`
	Messages []Message `bson:"messages" json:"messages"`
}

type Event struct {
	EventID string `bson:"eventId" json:"eventId"`
	Chats   []Chat `bson:"chats" json:"chats"`
}
