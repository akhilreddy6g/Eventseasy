"use client"

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { TableCell} from "@/components/ui/table";
import { useMemo } from "react";
import { useAppSelector } from "@/lib/store";
import { GuestInvite } from "./guest-overview";
import CommonAttendeeView from "../common/common-attendee-view";

export interface Guest {
  name: string;
  email: string;
  status: "Invited" | "Accepted";
}

const GuestTable = ({eventId}: GuestInvite) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const guestData = useAppSelector((state)=> state.eventGuestsSliceReducer)

  const mappedData = useMemo(() => {
    if(guestData.eventGuests.length>0){
      const combined: Guest [] = guestData.eventGuests
      return combined
    }
    return null
  }, [guestData]); 

  const filteredGuests = Array.isArray(mappedData)
  ? mappedData.filter(
      (guest: any) =>
        guest?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        guest?.email?.toLowerCase()?.includes(searchTerm.toLowerCase())
    )
  : [];

  function specialComponent(guestParam: any, property: string, key:string){
    return (
      <TableCell key={key} className="flex justify-center p-3">
        <span
          className={`px-3 py-2 text-xs font-medium rounded-md  ${
            guestParam?.[property] === "Accepted"
              ? "bg-green-100 text-green-600"
              : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {guestParam?.[property]}
        </span>
      </TableCell>
    )
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <div className="flex items-center gap-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Event Guests</h2>
            <div className="mb-4 flex-1">
                <Input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                />
            </div>
        </div>
        <CommonAttendeeView attendee={filteredGuests} headers={['name', 'email', 'status']} special={["status"]} footer="No guests found" spclComp={{status:specialComponent}}></CommonAttendeeView>
    </div>
  );
};

export default GuestTable;
