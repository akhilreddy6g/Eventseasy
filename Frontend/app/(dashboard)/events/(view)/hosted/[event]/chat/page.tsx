import { Metadata } from "next"
import { ChatTabs } from "@/components/dashboard/chat/chat-tabs"

export const metadata: Metadata = {
  title: "Live Chat - EventBuzz",
  description: "Chat with event participants",
}

export default async function ChatPage({params}: { params: {event: string }}) {
  const eventId = params?.event?.split("sstc")?.[0];
  return <ChatTabs accType="Host" eventId={eventId}/>
}