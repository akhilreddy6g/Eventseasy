import { Metadata } from "next";
import { EventOverview } from "@/components/dashboard/event-content/event-overview";

export const metadata: Metadata = {
  title: "Overview - Eventseasy",
  description: "View the event overview",
};

export default function OverviewPage({ params }: { params: { event: string } }) {
  return <EventOverview eventId={params.event.split("sstc")[0]} />;
}
