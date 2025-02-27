package websocket

import (
	"fmt"
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct{
	ID string
	Conn *websocket.Conn
	Pool *Pool
	mu sync.Mutex
}
type Message struct{
	Type int `json:"type"`
	Body string `json:"body"`
}
func (c *Client) Read(){
	defer func(){
		c.Pool.Unregister <- c
		c.Conn.Close()
	}()
	for {
		msgType, p, err := c.Conn.ReadMessage()
		if err != nil{
			fmt.Println(err)
			return 
		}
		message := Message{Type: msgType, Body: string(p)}
		c.Pool.Broadcast <- message
		fmt.Println("Message received:", message)
	
	}
	
}