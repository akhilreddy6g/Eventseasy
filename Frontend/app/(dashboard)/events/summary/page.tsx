import { Metadata } from "next"
import { EventTabs } from "@/components/dashboard/events/event-tabs"

export const metadata: Metadata = {
  title: "Events - Eventseasy",
  description: "View and manage your events",
}

export default function EventsSummaryPage() {
  return <EventTabs />
}