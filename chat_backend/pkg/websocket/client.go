package websocket

import (
	// "fmt"
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	EventId string
	ChatId  string
	User    string
	Conn    *websocket.Conn
	Pool    *Pool
	mu      sync.Mutex
}

type Body struct {
	EventId   string
	ChatId    string
	User      string
	Username  string
	Message   string
	Timestamp string
}
