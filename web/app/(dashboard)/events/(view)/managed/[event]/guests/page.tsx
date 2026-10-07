import { Metadata } from "next"
import { GuestList } from "@/components/dashboard/guests/guest-overview"

export const metadata: Metadata = {
  title: "Guests - Eventseasy",
  description: "Manage event guests and invitations",
}

export default async function GuestsPage({ params }: { params: Promise<{ event: string }> }) {
  const { event } = await params;
  const eventId = event?.split("sstc")?.[0];

  return (
    <div className="space-y-6 flex-1">
      <GuestList eventId={eventId}/>
    </div>
  )
}