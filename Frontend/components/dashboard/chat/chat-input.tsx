"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppDispatch, useAppSelector } from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { onNewMessage, onChatCompRender } from "@/lib/features/chat-slice";

export interface ChatHistoryType {
  chatHistory: [];
}
export default function ChatInput() {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const [socketConn, setSocketConn] = useState<WebSocket>();
  const chatMessages = useAppSelector((state) => state.chatMessageReducer);
  const socketInitFlag = chatMessages.connectionFlag;
  const localFlag = useRef(true);

  if (socketConn) {
    socketConn.onmessage = (event: any) => {
      console.log("Message form Web socket:", event.data);
      dispatch(onNewMessage(event.data));
    };

    socketConn.onclose = (event) => {
      console.log("Socket closed", event);
    };

    socketConn.onerror = (event) => {
      console.log("Socket error:", event);
    };
  }

  let sendMessage = () => {
    console.log("Sending message:", message);
    if (socketConn) {
      socketConn.send(message);
    }
    setMessage("");
  };

  useEffect(() => {
    if (socketInitFlag && localFlag.current) {
      const socket = new WebSocket("ws://localhost:4001/ws");
      setSocketConn(socket);
      socket.onopen = (event) => {
        console.log("WebSocket connection opened");
      };
      dispatch(onChatCompRender());
      localFlag.current = false;
    }
  }, []);
  return (
    <div className="flex p-2 w-full"> 
      <Input
        id="message-id"
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1"
      ></Input>
      <Button className="ml-2" 
        onClick={(e) => {
          sendMessage();
        }}
      >
        Send
      </Button>
    </div>
  );
}
