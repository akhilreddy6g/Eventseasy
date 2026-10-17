import { Metadata } from "next";
import { EventDestination } from "@/components/dashboard/event-content/event-destination";

export const metadata: Metadata = { title: "Destination - Eventseasy", description: "View the event destination" };
export default function DestinationPage({ params }: { params: { event: string } }) { return <EventDestination eventId={params.event.split("sstc")[0]} />; }
