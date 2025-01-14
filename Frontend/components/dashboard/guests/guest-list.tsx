"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCheck, Users } from "lucide-react"

const guests = {
  invited: [
    { id: 1, name: "John Doe", email: "john@example.com", status: "invited" },
    // Add more invited guests...
  ],
  accepted: [
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "accepted" },
    // Add more accepted guests...
  ],
  awaiting: [
    { id: 3, name: "Bob Wilson", email: "bob@example.com", status: "pending" },
    // Add more pending guests...
  ],
}

export function GuestList() {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Guest List</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="invited">
          <TabsList>
            <TabsTrigger value="invited">
              <Users className="mr-2 h-4 w-4" />
              Invited ({guests.invited.length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              <UserCheck className="mr-2 h-4 w-4" />
              Accepted ({guests.accepted.length})
            </TabsTrigger>
            {/* <TabsTrigger value="awaiting">
              <UserClock className="mr-2 h-4 w-4" />
              Awaiting ({guests.awaiting.length})
            </TabsTrigger> */}
          </TabsList>
          <TabsContent value="invited" className="mt-4">
            {guests.invited.length > 0 ? (
              <ul>
                {guests.invited.map((guest) => (
                  <li key={guest.id}>
                    {guest.name} ({guest.email})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No invited guests.</p>
            )}
          </TabsContent>
          <TabsContent value="accepted" className="mt-4">
            {guests.accepted.length > 0 ? (
              <ul>
                {guests.accepted.map((guest) => (
                  <li key={guest.id}>
                    {guest.name} ({guest.email})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No accepted guests.</p>
            )}
          </TabsContent>
          <TabsContent value="awaiting" className="mt-4">
            {guests.awaiting.length > 0 ? (
              <ul>
                {guests.awaiting.map((guest) => (
                  <li key={guest.id}>
                    {guest.name} ({guest.email})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No guests awaiting response.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
