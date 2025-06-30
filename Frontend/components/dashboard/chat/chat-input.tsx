"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppDispatch, useAppSelector } from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { onNewMessage, onChatCompRender } from "@/lib/features/chat-slice";
import { apiUrl } from "@/components/noncomponents";

export interface ChatHistoryType {
  chatHistory: [];
}
export default function ChatInput({eventId, chatId}:{eventId: string, chatId: string}) {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const [socketConn, setSocketConn] = useState<WebSocket>();
  const chatMessages = useAppSelector((state) => state.chatMessageReducer);
  const userInfo = useAppSelector((state)=> state.userLoginSliceReducer);
  // const socketInitFlag = chatMessages.connectionFlag;
  const localFlag = useRef(true);

  async function getConnStr (eventId: string, chatId: string) {
    const data = await apiUrl.post(`/message/new-ws-conn?eventId=${eventId}&chatId=${chatId}`)
    return data.data
  }  

  if (socketConn) {
    socketConn.onmessage = (event: any) => {
      console.log("Message from Web socket:", event.data);
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
    const data = {eventId: eventId, chatId: chatId, user: userInfo.user || sessionStorage.getItem("user"), username: userInfo.userName || sessionStorage.getItem("userName"), message: message, timestamp: new Date()}
    apiUrl.post('/message/push-msg', data)
    setMessage("");
  };

  useEffect(() => {
    if (localFlag.current) {
      (async () => {
        try {
          const data: {success: string, data: string} = await getConnStr(eventId, chatId); 
          const socket = new WebSocket(`ws://${data.success? data.data.split('//')[1] : "localhost:4001"}/ws?eventId=${eventId}&chatId=${chatId}&user=${userInfo.user || sessionStorage.getItem("user")}`);
          setSocketConn(socket);
          socket.onopen = () => {
            console.log("WebSocket connection opened");
          };
          dispatch(onChatCompRender());
          localFlag.current = false;
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
