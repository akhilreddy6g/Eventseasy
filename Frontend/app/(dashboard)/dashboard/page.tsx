import { Metadata } from "next"
import { DashboardOverview } from "@/components/dashboard/overview"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export const metadata: Metadata = {
  title: "Dashboard - EventBuzz",
  description: "Manage your events and view analytics",
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardOverview />
      <div className="grid gap-8 md:grid-cols-2">
        <UpcomingEvents />
        <RecentActivity />
      </div>
    </div>
  )
}