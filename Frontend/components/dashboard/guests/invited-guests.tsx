import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { useAppSelector } from "@/lib/store";
import { Guest } from "./view-guests";
import CommonGuestView from "./common-guest-view";

const InvitedList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const guestState = useAppSelector((state)=> state.eventGuestsSliceReducer)
  const [invitees, setInvitees] =  useState<Guest[]>(guestState.inviteResponsePendingGuests);

  const filteredInvitees = invitees.filter(
    (invitee) =>
      invitee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resendInvite = (email: string) => {
    console.log(`Invite resent to ${email}`);
  };

  function specialComponent(guestParam: any, property: string, key:string){
    return (
      <TableCell key={"button"+key} className="flex justify-center px-3">
        <Button
          onClick={() => resendInvite(guestParam?.["email"])}
          className="text-xs font-medium bg-primary text-white px-3 rounded-md hover:bg-primary/90"
        >
          Resend Invite
        </Button>
      </TableCell>
    )
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <div className="flex items-center gap-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Invited Guests</h2>
            <div className="mb-4 flex-1">
                <Input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                />
        </div>
      </div>
      <CommonGuestView guests={filteredInvitees} headers={['name', 'email', 'action']} special="action" footer="No guests found" spclComp={specialComponent}></CommonGuestView>
    </div>
  );
};

export default InvitedList;
