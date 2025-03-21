"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, History, Calendar } from "lucide-react";
import { useState } from "react";
import LiveChat from "./chat-window";
import ChatForm from "./chat-form";

export function ChatTabs({accType}:{accType: string}) {
  const [newChat, toggleNewChat] = useState(false);
  const [newFutureChat, toggleNewFutureChat] = useState(false);
  const [activeTab, setActiveTab] = useState("current");

  const toggleForm = (num: number) => {
    if (num === 0) {
      toggleNewChat(true);
      toggleNewFutureChat(false);
    } else if (num==1) {
      toggleNewFutureChat(true);
      toggleNewChat(false);
    } else {
      toggleNewChat(false);
      toggleNewFutureChat(false);
    }
  }

  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Live Chat</CardTitle>
        {accType !== "Attend" && 
        <div className="flex gap-2">
        <Button className={`${newChat && "bg-yellow-100 text-yellow-600 hover:bg-yellow-100"}`} onClick={() => toggleForm(0)}>
          <MessageSquare className={`mr-2 h-4 w-4`}/>
          <p>New Chat</p>
        </Button>
        <Button className={`${newFutureChat && "bg-yellow-100 text-yellow-600 hover:bg-yellow-100"}`} onClick={() => toggleForm(1)}>
          <div className={`mr-2 h-4 w-4 ${newFutureChat && "bg-yellow-100 text-yellow-600"}`}><img src={`/images/${newFutureChat ? "future-orange.png" : "future-white.png"}`} alt="future icon"/></div>
          <p>Plan Ahead</p>
        </Button>
        </div>}
      </CardHeader>
      <CardContent>
        <Tabs value={newChat || newFutureChat ? "" : activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex-1" onClick={()=> {toggleForm(2)}}>
            <TabsTrigger value="current" className="w-1/3">
              <MessageSquare className="mr-2 h-4" />
              Current Chats
            </TabsTrigger>
            <TabsTrigger value="past" className="w-1/3">
              <History className="mr-2 h-4"/>
              Past Chats
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="w-1/3">
              <Calendar className="mr-2 h-4" />
              Upcoming Chats
            </TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="my-4 flex justify-center items-center">
            <LiveChat></LiveChat>
          </TabsContent>
          <TabsContent value="past" className="mt-4">
          </TabsContent>
          <TabsContent value="upcoming" className="mt-4">
          </TabsContent>
        </Tabs>
        {newChat && <ChatForm newFutureChat={false}></ChatForm>}
        {newFutureChat && <ChatForm newFutureChat={true}></ChatForm>}
      </CardContent>
    </Card>
  );
}
