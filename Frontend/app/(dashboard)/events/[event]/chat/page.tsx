import { Metadata } from "next"
import { ChatTabs } from "@/components/dashboard/chat/chat-tabs"

export const metadata: Metadata = {
  title: "Live Chat - EventBuzz",
  description: "Chat with event participants",
}

export async function generateStaticParams() {
  // Fetch or define the list of dynamic event slugs
  const events = await fetchEvents();

  return events.map((event) => ({
    event: event.slug,
  }));
}

// Replace this with your actual API or static data
async function fetchEvents() {
  return [
    { slug: "1" },
    { slug: "2" },
    { slug: "ak" },
  ];
}

export default function ChatPage() {
  return <ChatTabs />
}