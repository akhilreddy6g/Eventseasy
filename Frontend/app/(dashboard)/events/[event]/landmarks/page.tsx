import { Metadata } from "next"
import { LandmarksList } from "@/components/dashboard/landmarks/landmarks-list"
import { PathToDestination } from "@/components/dashboard/landmarks/path-to-destination"

export const metadata: Metadata = {
  title: "Landmarks - EventBuzz",
  description: "Manage event locations and landmarks",
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

export default function LandmarksPage() {
  return (
    <div className="space-y-8 flex-1">
      <LandmarksList />
      <PathToDestination />
    </div>
  )
}