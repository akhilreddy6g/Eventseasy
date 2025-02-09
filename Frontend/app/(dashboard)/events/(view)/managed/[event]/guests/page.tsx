import { Metadata } from "next"
import { GuestList } from "@/components/dashboard/guests/guest-overview"

export const metadata: Metadata = {
  title: "Guests - EventBuzz",
  description: "Manage event guests and invitations",
}

export default async function GuestsPage({ params }: { params: Promise<{ event: string }> }) {
  const { event } = await params;
  console.log("event params are: ", params);
  return (
    <div className="space-y-6 flex-1">
      <GuestList/>
    </div>
  )
}