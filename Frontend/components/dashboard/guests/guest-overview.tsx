"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCheck, Users } from "lucide-react"
import { Plus } from "lucide-react"
import { BookUser } from "@mynaui/icons-react";
import GuestTable, { Guest } from "./view-guests"
import InvitedList from "./invited-guests"
import InvitationAcceptedList from "./invitation-accepted-guests"
import InviteUser from "../common/common-invite"
import { apiUrl } from "@/components/noncomponents"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useDispatch} from "react-redux";
import { AppDispatch } from "@/lib/store"
import { onGuestsLoad, onInvitedGuestsLoad, onInviteResponsePendingGuestsLoad } from "@/lib/features/guest-slice"
import { useAppSelector } from "@/lib/store"

export interface GuestInvite {
  eventId: string
}

export interface GuestStructure {
  user: string
  userName: string
  accType: string
  access: boolean
  eventId: string
}

export interface MappedDataStructure {
  invited: Guest []
  attending: Guest []
  combined: Guest []
  totalIAGuests: number
  totalIRPGuests: number
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

  const separateEventGuests = (guestlist: GuestStructure []) => {
    const invited: GuestStructure [] = []
    const attending: GuestStructure [] = []
    guestlist.forEach(element => {
      if (element.access){
        attending.push(element)
      } else {
        invited.push(element)
      }
    });
    return {invited: invited, attending: attending}
  }

  const mappedData: MappedDataStructure = useMemo(() => {
    if(data?.success){
      const separatedEvents = separateEventGuests(data?.data);
      const invited: Guest [] = separatedEvents?.invited?.map((curr: GuestStructure) => ({name: curr.userName ?? "Missing", email: curr.user, status: "Invited"}))
      const attending: Guest [] = separatedEvents?.attending?.map((curr: any) => ({name: curr.userName ?? "Missing", email: curr.user, status: "Accepted"}))     
      const combined: Guest [] = [...invited, ...attending]
      return {invited: invited, attending: attending, combined: combined, totalIAGuests: attending?.length, totalIRPGuests: invited?.length}
    }
    return {invited: [], attending: [], combined: [], totalIAGuests: 0, totalIRPGuests: 0}
  }, [data]); 

  useEffect(()=>{
    dispatch(onInviteResponsePendingGuestsLoad(mappedData?.invited))
    dispatch(onInvitedGuestsLoad(mappedData?.attending))
    dispatch(onGuestsLoad(mappedData?.combined))
    changeCount({totalIAGuests: mappedData?.totalIAGuests, totalIRPGuests: mappedData?.totalIRPGuests})
  }, [mappedData])

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
              All Guests ({mappedData?.combined?.length})
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
            <InvitationAcceptedList eventId = {eventId}></InvitationAcceptedList>
          </TabsContent>
          <TabsContent value="invited" className="mt-4">
            <InvitedList eventId = {eventId}></InvitedList>
          </TabsContent>
          <TabsContent value="invite" className="mt-4">
            <InviteUser accType="Attend" eventId={eventId}></InviteUser>
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  )
}
