import ManagersOverview from "@/components/dashboard/managers/managers-overview";
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Guests - EventBuzz",
  description: "Manage event guests and invitations",
}

export default async function GuestsPage({ params }: { params: Promise<{ event: string }> }) {
  const { event } = await params;
  return (
    <div className="space-y-6 flex-1">
        <ManagersOverview eventId={event}></ManagersOverview>
    </div>
  )
}