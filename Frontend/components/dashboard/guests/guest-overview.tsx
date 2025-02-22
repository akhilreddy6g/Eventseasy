"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCheck, Users } from "lucide-react"
import { Plus } from "lucide-react"
import { BookUser } from "@mynaui/icons-react";
import GuestTable, { Guest } from "./view-guests"
import InvitedList from "./invited-guests"
import InvitationAcceptedList from "./invitation-accepted-guests"
import InviteUser from "../invite/common-invite"
import { apiUrl } from "@/components/noncomponents"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useDispatch} from "react-redux";
import { AppDispatch } from "@/lib/store"
import { guestSlice, onGuestsLoad, onInvitedGuestsLoad, onInviteResponsePendingGuestsLoad } from "@/lib/features/guest-slice"
import { useAppSelector } from "@/lib/store"

export interface GuestInvite {
  eventId: string
}

export interface GuestList {
  user: string
  userName: string
  accType: string
  access: boolean
  eventId: string
}

export function GuestList({eventId}: GuestInvite ) {
  const event = eventId
  const dispatch = useDispatch<AppDispatch>()
  const queryClient = useQueryClient()
  const [count, changeCount] = useState({totalIAGuests:0, totalIRPGuests: 0})
  const fetchData = async () => {
    const res = await apiUrl.get(`/events/guests?eventId=${eventId}`);
    return res.data
  };
  const newInviteState = useAppSelector((state)=> state.eventGuestsSliceReducer).guestsAdded
  const { data, error, isLoading } = useQuery({
    queryKey: ["guests"],
    queryFn: fetchData,
    retry: false
  })

  useEffect(()=> {
    queryClient.invalidateQueries({queryKey: ['guests']})
  }, [newInviteState])

  const separateEventGuests = (guestlist: GuestList []) => {
    const invited: GuestList [] = []
    const attending: GuestList [] = []
    guestlist.forEach(element => {
      if (element.access){
        attending.push(element)
      } else {
        invited.push(element)
      }
    });
    return {invited: invited, attending: attending}
  }

  const mappedData = useMemo(() => {
    if(data?.success){
      const separatedEvents = separateEventGuests(data?.data);
      const invited: Guest [] = separatedEvents?.invited?.map((curr: GuestList) => ({name: curr.userName ?? "none", email: curr.user, status: "Invited"}))
      dispatch(onInviteResponsePendingGuestsLoad(invited))
      const attending: Guest [] = separatedEvents?.attending?.map((curr: any) => ({name: "none", email: curr.user, status: "Accepted"}))
      changeCount({totalIAGuests: attending?.length, totalIRPGuests: invited?.length})
      dispatch(onInvitedGuestsLoad(attending))
      const combined: Guest [] = [...invited, ...attending]
      dispatch(onGuestsLoad(combined))
      return combined
    }
    return null
  }, [data]); 

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
              All Guests ({mappedData?.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="w-1/4">
              <UserCheck className="mr-2 h-4" />
              Accepted ({count.totalIAGuests})
            </TabsTrigger>
            <TabsTrigger value="invited" className="w-1/4">
              <Users className="mr-2 h-4" />
              Invited ({count.totalIRPGuests})
            </TabsTrigger>
            <TabsTrigger value="invite" className="w-1/4">
              <Plus className="mr-2 h-4" />
              Send Invitation
            </TabsTrigger>
          </TabsList>
          <TabsContent value="allguests" className="mt-4">
            <GuestTable eventId={eventId} ></GuestTable>
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
