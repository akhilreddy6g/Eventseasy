package main

import (
	"chat_server/pkg/websocket"
	"fmt"
	"net/http"
	//"github.com/gorilla/websocket"
)

// type Server struct{
//     //mu sync.RWMutex
//     conns map[*websocket.Conn]bool
// }

// func NewServer() *Server{
//     return &Server{
//         conns: make(map[*websocket.Conn]bool),
//     }
// }
// var upgrader = websocket.Upgrader{
//     ReadBufferSize: 1024,
//     WriteBufferSize: 1024,
//     CheckOrigin: func(r *http.Request) bool {
//         return true
//     },
// }
// func (s *Server) handleWS(w http.ResponseWriter, r *http.Request) {
//     conn, err := upgrader.Upgrade(w, r, nil)
//     if err != nil {
//         fmt.Println("Upgrade error:", err)
//         return
//     }
//     fmt.Println("Client connected:", conn.RemoteAddr())

//     // Add connection to map (optional, if handling multiple connections)
//     s.conns[conn] = true
//     defer func() {
//         fmt.Println("Client disconnected:", conn.RemoteAddr())
//         delete(s.conns, conn)
//         conn.Close()
//     }()

//     for {
//         messageType, data, err := conn.ReadMessage()
//         if err != nil {
//             fmt.Println("Read error:", err)
//             break // Break loop on read error
//         }
//         fmt.Printf("Received Message: %s\n", data)

//         // Echo back the message
//         if err := conn.WriteMessage(messageType, data); err != nil {
//             fmt.Println("Write error:", err)
//             break // Break loop on write error
//         }
//     }
// }

// // func (s *Server) handleWS(ws *websocket.Conn ){
// //     fmt.Println("Connected established with:", ws.RemoteAddr())
// //     s.mu.Lock()
// //     s.conns[ws] = true
// //     s.mu.Unlock()
// //     s.readLoop(ws)
// // }

// // func (s *Server) readLoop(ws *websocket.Conn){
// //     buf := make([]byte, 1024)
// //     for{
// //         n, err := ws.Read(buf)
// //         if err !=nil{
// //             if err == io.EOF {
// //                 break
// //             }
// //             fmt.Println("Read error:", err)
// //             continue
// //         }
// //         msg := buf[:n]
// //         fmt.Println(string(msg))
// //         ws.Write([]byte("Message recieved."))
// //     }

// // }

// func main(){
//     server := NewServer()
//     fmt.Println("Server Initiated")
//     //http.Handle("/ws", websocket.Handler(server.handleWS))
//     http.HandleFunc("/ws", server.handleWS)
//     http.ListenAndServe("0.0.0.0:4001", nil)
// }
func serveWS(pool *websocket.Pool, w http.ResponseWriter, r *http.Request){
    fmt.Println("websocket endpoint reached")
    conn, err := websocket.Upgrade(w, r)
    if err !=nil{
        fmt.Println("Read err:", err)
    }
    client := &websocket.Client{
        Conn : conn,
        Pool : pool,
    }

    pool.Register <- client
    client.Read()
}

func setupRoutes(){
    pool := websocket.NewPool();
    go pool.Start()
    http.HandleFunc("/ws", func (w http.ResponseWriter, r *http.Request){
        serveWS(pool, w, r)
    })
}

func main(){
    fmt.Println("Go's server started.")
    setupRoutes()
    http.ListenAndServe("0.0.0.0:4001", nil)
}