"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { TableCell } from "@/components/ui/table";
import { useMemo, useRef, useState } from "react";
import { AppDispatch, useAppSelector } from "@/lib/store";
import CommonAttendeeView from "../common/common-attendee-view";
import { apiUrl } from "@/components/noncomponents";
import { useAppDispatch } from "@/lib/hooks";
import { onNewManagerInvite } from "@/lib/features/manager-slice";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface Manager {
    name: string;
    email: string;
    status: "Invited" | "Accepted";
  }

export function ManagerList(props: {eventId: string}){
    const [searchTerm, setSearchTerm] = useState<string>("");
    const managerData = useAppSelector((state)=> state.eventManagersSliceReducer)
    const [eventUsers, setEventUsers] = useState<Manager[]>(managerData.eventManagers);
    const userDetails = useAppSelector((state)=> state.userLoginSliceReducer)
    const dispatch = useAppDispatch<AppDispatch>()
    const [resendFlag, setResendFlag] = useState(false)
    const [message, setMessage] = useState("");
    const eventUser = useRef({email: "", name: ""})

    const filteredManagers = managerData.eventManagers.filter(
        (manager) =>
            manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            manager.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    const setEventUserInfo = async (email: string, name: string) => {
      eventUser.current.email = email;
      eventUser.current.name = name;
      setResendFlag(!resendFlag)
    };

      const resendInvite = async () => {
        const data = {user: eventUser.current.email, username: eventUser.current.name, eventId: props.eventId, message: message, accType: "Manage", access: false, hostName: userDetails.userName || sessionStorage.getItem("userName")}
        const apiRequest = await apiUrl.post("/events/reinvite", data)
        if(apiRequest.data?.success){
          setResendFlag(!resendFlag)
          console.info(`Invite resent to ${eventUser.current.email}`);
        }
      };

      const removeUser = async (email: string, eventId: string, accType: string) => {
        const apiRequest  = await apiUrl.delete(`/events/attendee?user=${email}&eventId=${eventId}&accType=${accType}`)
        if(apiRequest.data?.success){
          setEventUsers((prev) => prev.filter((user) => user.email !== email));
          dispatch(onNewManagerInvite())
        } else {
          console.error(`Unable to remove user with email ${email}.`);
        }
      };

      function specialComponent(managerParam: any, property: string, key:string){
        return (
          <TableCell key={key} className="flex justify-center p-3">
            <span
              className={`px-3 py-2 text-xs font-medium rounded-md  ${
                managerParam?.[property] === "Accepted"
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {managerParam?.[property]}
            </span>
          </TableCell>
        )
      }

      function specialComponent1(managerParam: any, property: string, key:string){
        return (
            <TableCell key={key} className="p-3 text-center space-x-2">
                <Button
                    onClick={() => setEventUserInfo(managerParam?.["email"], managerParam?.["name"])}
                    className="text-xs font-medium bg-primary text-white px-3 rounded-md hover:bg-primary/90"
                    disabled={managerParam.status === "Accepted"}
                >
                    Resend Invite
                </Button>
                <Button
                onClick={() => removeUser(managerParam?.["email"], props.eventId, "Manage")}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                disabled={managerParam.status === "Invited"}
                >
                Remove
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
                  <h2 className="mb-4 text-lg font-semibold text-gray-800">Event Managers</h2>
                  <div className="mb-4 flex-1">
                      <Input
                      placeholder="Search by name or email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                      />
                  </div>
              </div>
              <CommonAttendeeView attendee={filteredManagers} headers={['name', 'email', 'status', 'action']} special={["status", "action"]} footer="No managers found" spclComp={{status: specialComponent, action: specialComponent1}}></CommonAttendeeView>
      </div>
      </>
    )
}