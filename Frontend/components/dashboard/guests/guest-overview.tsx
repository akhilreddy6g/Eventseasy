"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCheck, Users } from "lucide-react"
import { Plus } from "lucide-react"
import { BookUser } from "@mynaui/icons-react";
import GuestTable from "./view-guests"
import InvitedList from "./invited-guests"
import InvitationAcceptedList from "./invitation-accepted-guests"
import InviteUser from "../invite/common-invite"

interface guestInvite {
  eventId: string
}

export function GuestList({eventId}: guestInvite ) {
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
              All Guests ({15})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="w-1/4">
              <UserCheck className="mr-2 h-4" />
              Accepted ({10})
            </TabsTrigger>
            <TabsTrigger value="invited" className="w-1/4">
              <Users className="mr-2 h-4" />
              Invited ({5})
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
            <InviteUser accType="Attend" eventId={eventId}></InviteUser>
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  )
}
