"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppDispatch, useAppSelector } from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { onNewMessage, onChatCompRender } from "@/lib/features/chat-slice";
import { apiUrl } from "@/components/constants";

export interface Message {
  messageId: string
  username: string
  user: string
  message: string
  timestamp: string
}

export interface Chats {
  chatId: string,
  messageFetchFlag: boolean
  messages: Message[]
}

export interface Events {
  eventId: string,
  chats: Chats[]
}

export interface MessageBody {
  eventId: string,
  chatId: string,
  messageId: string,
  username: string,
  user: string,
  message: string,
  timestamp: string,
}

export interface ServerMessageBody {
  eventId: string,
  chatId: string,
  messages: Message[],
  messageFetchFlag: boolean
}

export default function ChatInput({eventId, chatId}:{eventId: string, chatId: string}) {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const [socketConn, setSocketConn] = useState<WebSocket>();
  const userInfo = useAppSelector((state)=> state.userLoginSliceReducer);
  const EventChatWsConnState = useAppSelector((state)=> state.chatMessageReducer);

  async function getConnStr (eventId: string, chatId: string) {
    const apiRequest = await apiUrl.post(`/chats/new-ws-conn?eventId=${eventId}&chatId=${chatId}`)
    return apiRequest.data
  }  

  if (socketConn) {
    socketConn.onmessage = (event: MessageEvent) => {
      try {
        const data: MessageBody = JSON.parse(event.data);
        dispatch(onNewMessage(data));
      } catch (err) {
        console.error("Failed to parse WebSocket message:", event.data, err);
      }
    };

    socketConn.onclose = (event) => {
      console.log("Socket closed", event);
    };

    socketConn.onerror = (event) => {
      console.log("Socket error:", event);
    };
  }

  let sendMessage = async () => {
    const data = {eventId: eventId, chatId: chatId, user: userInfo.user || sessionStorage.getItem("user"), username: userInfo.userName || sessionStorage.getItem("userName"), message: message, timestamp: new Date()}
    const apiRequest = await apiUrl.post('/chats/push-msg', data)
    const success = apiRequest.data.success
    if (success){
      const messageId = apiRequest.data.response
      const copy = {
        eventId: eventId,
        chatId: chatId,
        messageId: messageId,
        username: userInfo.userName || sessionStorage.getItem("userName") || "",
        message: message,
        timestamp: data.timestamp.toISOString(),
        user:( userInfo.user || sessionStorage.getItem("user")) ?? ""
      }
      if (apiRequest.data.success){
        dispatch(onNewMessage(copy))
        setMessage("");
      }
    }
  };

  useEffect(() => {

    if (!EventChatWsConnState.wsConnState.find((prev) => prev.eventId === eventId)?.chats.find((c) => c.chatId === chatId)?.connectionFlag){
      (async () => {
        try {
          const data: {success: string, response: string} = await getConnStr(eventId, chatId); 
          if (data.success){
            const socket = new WebSocket(`${process.env.NODE_ENV === "production" ? "wss" : "ws"}://${data.response.split('//')[1]}/ws?eventId=${eventId}&chatId=${chatId}&user=${userInfo.user || sessionStorage.getItem("user")}`);
            setSocketConn(socket);
            socket.onopen = () => {
              console.log("WebSocket connection opened");
              dispatch(onChatCompRender({eventId: eventId, chatId: chatId, connectionFlag: true}));
            };
          }
        } catch (error) {
          console.error("Error fetching connection string or initializing socket:", error);
        }
      })();
    }
  }, [eventId, chatId]);

  return (
    <div key={"ChatInput"+eventId} className="flex w-full"> 
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
