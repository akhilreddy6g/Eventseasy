import { Metadata } from "next"
import { GuestList } from "@/components/dashboard/guests/guest-overview"

export const metadata: Metadata = {
  title: "Guests - Eventseasy",
  description: "Manage event guests and invitations",
}

interface eventIdParam{
  event: string
}

export default function GuestsPage({ params }: { params: eventIdParam }) {
  const eventId = params?.event?.split("sstc")?.[0];

  return (
    <div className="space-y-6 flex-1">
      <GuestList eventId={eventId}/>
    </div>
  )
}