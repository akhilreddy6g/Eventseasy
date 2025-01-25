import { Metadata } from "next"
import { GuestList } from "@/components/dashboard/guests/guest-overview"
// import { SendInvitation } from "@/components/dashboard/guests/send-invitation"
import EventSidebar from "@/components/dashboard/events/event-sidebar";

export const metadata: Metadata = {
  title: "Guests - EventBuzz",
  description: "Manage event guests and invitations",
}

export async function generateStaticParams() {
  const events = await fetchEvents(); // Fetch the event slugs
  return events.map((event) => ({
    event: event.slug,
  }));
}

// Mock event data (replace with your actual data source).
async function fetchEvents() {
  return [
    { slug: "1" },
    { slug: "2" },
    { slug: "ak" },
  ];
}


export default async function GuestsPage({ params }: { params: Promise<{ event: string }> }) {
  const { event } = await params;
  return (
    <div className="space-y-6 flex-1">
      {/* <SendInvitation /> */}
      <GuestList/>
    </div>
  )
}