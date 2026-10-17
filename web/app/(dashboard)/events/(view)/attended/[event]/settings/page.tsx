import { Metadata } from "next";
import { EventSettings } from "@/components/dashboard/event-content/event-settings";

export const metadata: Metadata = { title: "Settings - Eventseasy", description: "Manage event settings" };
export default function SettingsPage({ params }: { params: { event: string } }) { return <EventSettings eventId={params.event.split("sstc")[0]} />; }
