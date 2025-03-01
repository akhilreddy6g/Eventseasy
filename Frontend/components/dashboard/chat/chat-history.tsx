"use client";
import { AppDispatch, useAppSelector } from "@/lib/store";
import ChatMessage from "./chat-message";
export function ChatHistory() {
  const chatMessages = useAppSelector((state) => state.chatMessageReducer);
  return (
    <>
      {chatMessages.chats.map((msg) => (
        <ChatMessage message={msg} key={msg}></ChatMessage>
      ))}
    </>
  );
}
