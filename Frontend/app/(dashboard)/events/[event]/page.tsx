import EventSidebar from "@/components/dashboard/events/event-sidebar";

// Generate static params for all dynamic event pages.
export async function generateStaticParams() {
  const events = await fetchEvents(); // Fetch the event slugs
  return events.map((event) => ({
    event: event.slug,
  }));
}

// Mock event data (replace with your actual data source).
async function fetchEvents() {
  return [
    { slug: "hosted" },
    { slug: "managed" },
    { slug: "attended" },
  ];
}

// Default export for the dynamic event page.
export default async function Page({ params }: { params: Promise<{ event: string }> }) {
  const { event } = await params;
  return (
    <div>
      <EventSidebar/>
    </div>
  );
}
