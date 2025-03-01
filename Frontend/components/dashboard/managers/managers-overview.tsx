"use client";

import React, { useEffect, useMemo} from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Hand, BookUser } from "@mynaui/icons-react";
import { Manager, ManagerList } from "./view-managers";
import { ManagerRequests } from "./manager-requests";
import InviteUser from "../common/common-invite";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/lib/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiUrl } from "@/components/noncomponents";
import { onManagersLoad } from "@/lib/features/manager-slice";

interface ManagerInvite {
  eventId: string
}

export interface ManagerStructure {
  user: string
  userName: string
  accType: string
  access: boolean
  eventId: string
}

export interface MappedDataStrcuture {
  combined: Manager []
}

const ManagersOverview = ({eventId}: ManagerInvite) => {
  const dispatch = useDispatch<AppDispatch>()
  const queryClient = useQueryClient()
  const fetchData = async () => {
    const res = await apiUrl.get(`/events/managers?eventId=${eventId}`);
    return res.data
  };
  const newInviteState = useAppSelector((state)=> state.eventManagersSliceReducer).managersAdded
  const { data, error, isLoading } = useQuery({
    queryKey: ["managers"],
    queryFn: fetchData,
    retry: false
  })

  useEffect(()=> {
    queryClient.invalidateQueries({queryKey: ['managers']})
  }, [newInviteState])

  const separateEventManagers = (managerlist: ManagerStructure []) => {
    const invited: ManagerStructure [] = []
    const attending: ManagerStructure [] = []
    managerlist.forEach(element => {
      if (element.access){
        attending.push(element)
      } else {
        invited.push(element)
      }
    });
    return {invited: invited, attending: attending}
  }

  const mappedData: MappedDataStrcuture = useMemo(() => {
    if(data?.success){
      const separatedEvents = separateEventManagers(data?.data);
      const invited: Manager [] = separatedEvents?.invited?.map((curr: ManagerStructure) => ({name: curr.userName ?? "Missing", email: curr.user, status: "Invited"}))
      const attending: Manager [] = separatedEvents?.attending?.map((curr: any) => ({name: curr.userName ?? "Missing", email: curr.user, status: "Accepted"}))     
      const combined: Manager [] = [...invited, ...attending]
      return {combined: combined}
    }
    return {combined: []}
  }, [data]); 

  useEffect(()=>{
    dispatch(onManagersLoad(mappedData?.combined))
  }, [mappedData])

  return (
    <Card>
        <CardHeader>
        <CardTitle>Manager List</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="allmanagers">
          <TabsList className="flex gap-2">
            <TabsTrigger value="allmanagers" className="w-1/3">
              <BookUser className="mr-2 h-4" />
              All Managers ({mappedData?.combined.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="w-1/3">
              <Hand className="mr-2 h-4" />
              Requests ({2})
            </TabsTrigger>
            <TabsTrigger value="invite" className="w-1/3">
              <Plus className="mr-2 h-4" />
              Send Invitation
            </TabsTrigger>
          </TabsList>
        <TabsContent value="allmanagers" className="mt-4">
            <ManagerList eventId={eventId}></ManagerList>
        </TabsContent>
        <TabsContent value="requests" className="mt-4">
            <ManagerRequests></ManagerRequests>
        </TabsContent>
        <TabsContent value="invite" className="mt-4">
            <InviteUser accType="Manage" eventId={eventId}></InviteUser>
        </TabsContent>
      </Tabs>
    </CardContent>
    </Card>
  );
};

export default ManagersOverview;
