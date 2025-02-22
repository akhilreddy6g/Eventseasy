"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell} from "@/components/ui/table";
import { useAppSelector } from "@/lib/store";
import { Guest } from "./view-guests";
import CommonAttendeeView from "../common/common-attendee-view";

const InvitationAcceptedList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const guestState = useAppSelector((state)=> state.eventGuestsSliceReducer)
  const [acceptedUsers, setAcceptedUsers] = useState<Guest[]>(guestState.inviteAcceptedGuests);
  const filteredAcceptedUsers = acceptedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const removeUser = (email: string) => {
    setAcceptedUsers((prev) => prev.filter((user) => user.email !== email));
    console.log(`User with email ${email} removed.`);
  };

  function specialComponent(guestParam: any, property: string, key:string){
    return (
      <TableCell key={"button" + key} className="flex justify-center px-3">
        <Button
          onClick={() => removeUser(guestParam?.["email"])}
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
