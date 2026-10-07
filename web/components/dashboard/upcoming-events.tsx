"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Users } from "lucide-react"

const events = [
  {
    id: 1,
    name: "Tech Conference 2024",
    date: "Mar 15, 2024",
    location: "San Francisco, CA",
    attendees: 250,
  },
  {
    id: 2,
    name: "Product Launch",
    date: "Mar 20, 2024",
    location: "New York, NY",
    attendees: 150,
  },
  {
    id: 3,
    name: "Team Building Workshop",
    date: "Mar 25, 2024",
    location: "Austin, TX",
    attendees: 50,
  },
]

export function UpcomingEvents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium">{event.name}</p>
                <div className="flex items-center text-sm text-muted-foreground space-x-4">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {event.date}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="mr-1 h-3 w-3" />
                    {event.location}
                  </span>
                  <span className="flex items-center">
                    <Users className="mr-1 h-3 w-3" />
                    {event.attendees} attendees
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}