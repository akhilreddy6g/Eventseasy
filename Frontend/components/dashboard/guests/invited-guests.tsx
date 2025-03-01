"use client"

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { useAppSelector } from "@/lib/store";
import { Guest } from "./view-guests";
import CommonAttendeeView from "../common/common-attendee-view";
import { apiUrl } from "@/components/noncomponents";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const InvitedList = (props: {eventId: string}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const guestState = useAppSelector((state)=> state.eventGuestsSliceReducer)
  const [invitees, setInvitees] =  useState<Guest[]>(guestState.inviteResponsePendingGuests);
  const userDetails = useAppSelector((state)=> state.userLoginSliceReducer)
  const [resendFlag, setResendFlag] = useState(false)
  const [message, setMessage] = useState("");
  const eventUser = useRef({email: "", name: ""})

  const filteredInvitees = invitees.filter(
    (invitee) =>
      invitee?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      invitee?.email?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const setEventUserInfo = async (email: string, name: string) => {
    eventUser.current.email = email;
    eventUser.current.name = name;
    setResendFlag(!resendFlag)
  };

  async function resendInvite(){
    const data = {user: eventUser.current.email, username: eventUser.current.name, eventId: props.eventId, message: message, accType: "Attend", access: false, hostName: userDetails.userName || sessionStorage.getItem("userName")}
    await apiUrl.post("/events/reinvite", data)
    setResendFlag(!resendFlag)
    console.info(`Invite resent to ${eventUser.current.email}`);
  }

  function specialComponent(guestParam: any, property: string, key:string){
    return (
      <TableCell key={"button"+key} className="flex justify-center px-3">
        <Button
          onClick={() => setEventUserInfo(guestParam?.["email"], guestParam?.["name"])}
          className="text-xs font-medium bg-primary text-white px-3 rounded-md hover:bg-primary/90"
        >
          Resend Invite
        </Button>
      </TableCell>
    )
  }

  return (
    <>
      {resendFlag && 
        <Dialog open={resendFlag} onOpenChange={setResendFlag}>
          <DialogContent aria-description="Message" className="w-96 p-6 bg-white rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-center">Enter Your Message</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Please Include an Invitation.
            </DialogDescription>
            <div className="flex flex-col gap-4">
              <Input
                id="message"
                placeholder="Message (Optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full"
              />
              <Button onClick={resendInvite} className="w-full">
                Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }

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
      <CommonAttendeeView attendee={filteredInvitees} headers={['name', 'email', 'action']} special={["action"]} footer="No guests found" spclComp={{action:specialComponent}}></CommonAttendeeView>
    </div>
  </>
  );
};

export default InvitedList;
