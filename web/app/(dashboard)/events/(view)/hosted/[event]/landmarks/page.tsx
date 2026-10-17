import { Metadata } from "next"
import { EventLandmarks } from "@/components/dashboard/event-content/event-landmarks"

export const metadata: Metadata = {
  title: "Landmarks - Eventseasy",
  description: "Manage event locations and landmarks",
}

export default function LandmarksPage({ params }: { params: { event: string } }) {
  return <EventLandmarks eventId={params.event.split("sstc")[0]} />
}
