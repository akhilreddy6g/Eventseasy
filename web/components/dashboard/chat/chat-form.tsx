'use client';

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import DatePicker from "react-datepicker";
import { SearchUser } from "./search-user";
import { apiUrl } from "@/components/constants";
import { useAppDispatch } from "@/lib/hooks";
import { AppDispatch } from "@/lib/store";
import { onNewChat } from "@/lib/features/chat-info-slice";
import { calcTime } from "./chat-window";

export interface UserInfo {
  user: string;
  userName: string;
  accType: string;
}

export default function ChatForm({newFutureChat, eventId}:{newFutureChat: boolean, eventId: string}) {
  const [chatName, setChatName] = useState("");
  const [chatDescription, setchatDescription] = useState("");
  const [chatDate, setChatDate] = useState<Date>(calcTime(-8));
  const [chatStartTime, setChatStartTime] = useState<Date>(new Date());
  const [chatEndTime, setChatEndTime] = useState<Date>(new Date(new Date().setHours(23, 59, 59, 999)));
  const [initialUsers, setInitialUsers] = useState<UserInfo[]>([]);
  const [restrictedUsers, setRestrictedUsers] = useState<UserInfo[]>([]);
  const dispatch = useAppDispatch<AppDispatch>()
  const initRef = useRef(true);

  const formattedTime = (date: Date) => { 
    const formattedTime =date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
  return formattedTime
  };

  useEffect(() => {
    const fetchRestrictedUsers = async () => {
      try {
        const apiRequest = await apiUrl.get(`events/users?eventId=${eventId}`);
        const fetchedRestrictedUsers = apiRequest.data.success ? apiRequest.data.response : [];
        setInitialUsers(fetchedRestrictedUsers);
      } catch (error) {
        console.error("Error fetching restricted users:", error);
      }
    };
    if (initRef.current) {
      fetchRestrictedUsers();
      initRef.current = false;
    }
  }, [eventId]);

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    const chatType = newFutureChat? "upcoming" : "current";
    const data = {}
    try {
      const data = { eventId, chatName, chatDescription, chatType, chatDate: chatDate instanceof Date ? chatDate.toISOString().split('T')[0] : undefined, chatStartTime: formattedTime(chatStartTime), chatEndTime: formattedTime(chatEndTime), chatStatus: false, restrictedUsers };
      const apiRequest = await apiUrl.post("/chats/create", data)
      if(apiRequest?.data?.success){
        setChatName("");
        setchatDescription("");
        setChatDate(calcTime(-8));
        setChatStartTime(new Date());
        setChatEndTime(new Date(new Date().setHours(23, 59, 59, 999)));
        setRestrictedUsers([]);
        dispatch(onNewChat())
      } else {
        console.log("Failed to create a new chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }

  };

  return (
    <Card className="max-w-md mx-auto p-2 shadow-lg max-h-[450px] mt-4">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[400px] overflow-scroll">
          <div className="px-1">
            <Label className="block my-2 text-sm font-medium w-full">Chat Name</Label>
            <Input value={chatName} className="text-sm border border-gray-300 rounded-md" onChange={(e) => setChatName(e.target.value)} placeholder="Enter chat name" />
          </div>
          
          <div className="px-1">
            <Label className="block mb-2 text-sm font-medium">Chat Description</Label>
            <Input value={chatDescription} className="w-full p-2 text-sm border border-gray-300 rounded-md" onChange={(e) => setchatDescription(e.target.value)} placeholder="Enter chat description" />
          </div>

          {newFutureChat && <div className="px-1">
            <Label className="block mb-2 text-sm font-medium">Chat Date</Label>
            <div className="flex justify-center">
            <Calendar selected={chatDate} onDayClick={(date: any) => (date >= new Date().setHours(new Date().getHours()-4)) && setChatDate(date)} disabled={(date: Date) => new Date(date.setHours(23, 59, 59, 999)).getTime() < new Date().getTime() - 5 * 60 * 60 * 1000}            />
            </div>
          </div>}

          {newFutureChat && <div className="flex flex-col px-1">
            <Label className="block mb-2 text-sm font-medium">Chat Start Time</Label>
            <DatePicker
              selected={chatStartTime}
              onChange={(time) => time && setChatStartTime(time)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="hh:mm aa"
              className="w-full p-2 text-sm border border-gray-300 rounded-md"
            />
          </div>}

          <div className="flex flex-col px-1">
            <Label className="block mb-2 text-sm font-medium">Chat End Time</Label>
            <DatePicker
              selected={chatEndTime}
              onChange={(time) => time && setChatEndTime(time)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="hh:mm aa"
              className="w-full p-2 text-sm border border-gray-300 rounded-md"
            />
          </div>

          <div className="px-1">
            <Label className="block mb-2 text-sm font-medium">Restrict Users</Label>
            <SearchUser users={initialUsers} selectedUsers={restrictedUsers} setSelectedUsers={setRestrictedUsers} />
          </div>

          <Button type="submit" className="w-full sticky bottom-0 mt-2 z-10">Create Chat</Button>
        </form>
      </CardContent>
    </Card>
  );
}
