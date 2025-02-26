"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell} from "@/components/ui/table";
import { AppDispatch, useAppSelector } from "@/lib/store";
import { Guest } from "./view-guests";
import CommonAttendeeView from "../common/common-attendee-view";
import { apiUrl } from "@/components/noncomponents";
import { useDispatch } from "react-redux";
import { onNewInvite } from "@/lib/features/guest-slice";

const InvitationAcceptedList = (props : {eventId: string}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const guestState = useAppSelector((state)=> state.eventGuestsSliceReducer)
  const [acceptedUsers, setAcceptedUsers] = useState<Guest[]>(guestState.inviteAcceptedGuests);
  const dispatch = useDispatch<AppDispatch>()
  const filteredAcceptedUsers = acceptedUsers.filter(
    (user) =>
      user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const removeUser = async (email: string, eventId: string, accType: string) => {
    const response  = await apiUrl.delete(`/events/attendee?user=${email}&eventId=${eventId}&accType=${accType}`)
    if(response?.data?.success){
      setAcceptedUsers((prev) => prev.filter((user) => user.email !== email));
      dispatch(onNewInvite())
    } else {
      console.error(`Unable to remove user with email ${email}.`);
    }
  };

  function specialComponent(guestParam: any, property: string, key:string){
    return (
      <TableCell key={"button" + key} className="flex justify-center px-3">
        <Button
          onClick={() => removeUser(guestParam?.["email"], props.eventId, "Attend")}
          className="text-xs font-medium bg-red-500 text-white px-3 rounded-md hover:bg-red-600"
        >
          Remove
        </Button>
      </TableCell>
    )
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <div className="flex items-center gap-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Accepted Guests</h2>
            <div className="mb-4 flex-1">
                <Input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                />
        </div>
      </div>
      <CommonAttendeeView attendee={filteredAcceptedUsers} headers={['name', 'email', 'action']} special={["action"]} footer="No guests found" spclComp={{action:specialComponent}}></CommonAttendeeView>
    </div>
  );
};

export default InvitationAcceptedList;
