"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { TableCell } from "@/components/ui/table";
import { useMemo, useState } from "react";
import { useAppSelector } from "@/lib/store";
import CommonAttendeeView from "../common/common-attendee-view";

export interface Manager {
    name: string;
    email: string;
    status: "Invited" | "Accepted";
  }

export function ManagerList(){
    const [searchTerm, setSearchTerm] = useState<string>("");
    const managerData = useAppSelector((state)=> state.eventManagersSliceReducer)

    const mappedData = useMemo(() => {
        if(managerData.eventManagers.length>0){
          const combined: Manager [] = managerData.eventManagers
          return combined
        }
        return []
      }, [managerData]); 

    const filteredManagers = mappedData.filter(
        (manager) =>
            manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            manager.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

      const resendInvite = (email: string) => {
        console.log(`Resending invite to ${email}`);
        // Add actual API logic if required
      };

      const removeManager = (email: string) => {
        // Api
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
                {managerParam.status === "Invited" && (
                <Button
                    onClick={() => resendInvite(managerParam?.["email"])}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                >
                    Resend Invite
                </Button>
                )}
                <Button
                onClick={() => removeManager(managerParam?.["email"])}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                >
                Remove
                </Button>
        </TableCell>
        )
      }

    return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
        <div className="flex items-center gap-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">All Managers</h2>
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
    )
}