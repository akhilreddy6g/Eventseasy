"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Calendar, MessageSquare, Mail } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "rsvp",
    message: "New RSVP from John Doe",
    time: "5 minutes ago",
    icon: UserPlus,
  },
  {
    id: 2,
    type: "event",
    message: "Event 'Tech Conference' updated",
    time: "1 hour ago",
    icon: Calendar,
  },
  {
    id: 3,
    type: "comment",
    message: "New comment on Product Launch",
    time: "2 hours ago",
    icon: MessageSquare,
  },
  {
    id: 4,
    type: "email",
    message: "Reminder emails sent to attendees",
    time: "3 hours ago",
    icon: Mail,
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <activity.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium">{activity.message}</p>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}