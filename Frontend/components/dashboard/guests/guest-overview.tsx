"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCheck, Users } from "lucide-react"
import { Plus } from "lucide-react"
import { BookUser } from "@mynaui/icons-react";
import GuestTable from "./view-guests"
import InvitedList from "./invited-guests"
import InviteGuest from "./invite-guest"
import InvitationAcceptedList from "./invitation-accepted-guests"

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
        <Tabs defaultValue="allguests">
          <TabsList className="flex gap-2">
            <TabsTrigger value="allguests" className="w-1/4">
              <BookUser className="mr-2 h-4" />
              All Guests ({guests.accepted.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="w-1/4">
              <UserCheck className="mr-2 h-4" />
              Accepted ({guests.accepted.length})
            </TabsTrigger>
            <TabsTrigger value="invited" className="w-1/4">
              <Users className="mr-2 h-4" />
              Invited ({guests.invited.length})
            </TabsTrigger>
            <TabsTrigger value="invite" className="w-1/4">
              <Plus className="mr-2 h-4" />
              Send Invitation
            </TabsTrigger>
          </TabsList>
          <TabsContent value="allguests" className="mt-4">
            <GuestTable></GuestTable>
          </TabsContent>
          <TabsContent value="accepted" className="mt-4">
            <InvitationAcceptedList></InvitationAcceptedList>
          </TabsContent>
          <TabsContent value="invited" className="mt-4">
            <InvitedList></InvitedList>
          </TabsContent>
          <TabsContent value="invite" className="mt-4">
            <InviteGuest></InviteGuest>
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  )
}
