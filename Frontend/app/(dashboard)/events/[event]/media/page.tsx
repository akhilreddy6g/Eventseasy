import { Metadata } from "next"
import { MediaTabs } from "@/components/dashboard/media/media-tabs"

export const metadata: Metadata = {
  title: "Media - EventBuzz",
  description: "Manage event photos and videos",
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


export default function MediaPage() {
  return <MediaTabs/>
}