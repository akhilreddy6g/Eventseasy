"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin } from "lucide-react"

const attendedEvents = [
  {
    id: 1,
    name: "Tech Conference 2024",
    date: "Jan 15, 2024",
    location: "San Francisco, CA",
    role: "Attendee",
  },
  // Add more events...
]

export function EventsAttended() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Events Attended</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {attendedEvents.map((event) => (
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}