import { Metadata } from "next"
import { ChatTabs } from "@/components/dashboard/chat/chat-tabs"

export const metadata: Metadata = {
  title: "Live Chat - EventBuzz",
  description: "Chat with event participants",
}

export default function ChatPage() {
  return <ChatTabs accType="Manage"/>
}