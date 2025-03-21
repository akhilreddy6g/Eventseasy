'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { SearchUser } from "./search-user";
import { mockUsers } from "@/public/mockData";

export default function ChatForm({newFutureChat}:{newFutureChat: boolean}) {
  const [chatName, setChatName] = useState("");
  const [chatInfo, setChatInfo] = useState("");
  const [chatDate, setChatDate] = useState<Date>(new Date());
  const [chatStartTime, setChatStartTime] = useState<Date>(new Date());
  const [chatEndTime, setChatEndTime] = useState<Date>(new Date(new Date().setHours(23, 59, 59, 999)));
  const [restrictedUsers, setRestrictedUsers] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ chatName, chatInfo, chatDate, chatStartTime, chatEndTime, restrictedUsers });
  };

  return (
    <Card className="max-w-md mx-auto p-2 shadow-lg max-h-[450px]">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[400px] overflow-scroll">
          <div className="px-1">
            <Label className="block my-2 text-sm font-medium w-full">Chat Name</Label>
            <Input value={chatName} className="text-sm border border-gray-300 rounded-md" onChange={(e) => setChatName(e.target.value)} placeholder="Enter chat name" />
          </div>
          
          <div className="px-1">
            <Label className="block mb-2 text-sm font-medium">Chat Description</Label>
            <Input value={chatInfo} className="w-full p-2 text-sm border border-gray-300 rounded-md" onChange={(e) => setChatInfo(e.target.value)} placeholder="Enter chat description" />
          </div>

          {newFutureChat && <div className="px-1">
            <Label className="block mb-2 text-sm font-medium">Chat Date</Label>
            <div className="flex justify-center">
            <Calendar selected={chatDate} onDayClick={(date: any) => (date >= new Date().setHours(new Date().getHours()-4)) && setChatDate(date)} disabled={(date: Date) => new Date(date.setHours(23, 59, 59, 999)).getTime() < new Date().getTime() - 4 * 60 * 60 * 1000}            />
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
            <SearchUser users={mockUsers} selectedUsers={restrictedUsers} setSelectedUsers={setRestrictedUsers} />
          </div>

          <Button type="submit" className="w-full sticky bottom-0 mt-2 z-10">Create Chat</Button>
        </form>
      </CardContent>
    </Card>
  );
}
