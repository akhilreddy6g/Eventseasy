"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, History, Calendar } from "lucide-react";
import ChatInput from "./chat-input";
import { useEffect, useState } from "react";
import { ChatHistory } from "./chat-history";
import LiveChat from "./chat-window";

export function ChatTabs({accType}:{accType: string}) {
  const [chatHistory, setChatHistory] = useState([]);
  useEffect(() => {}, [chatHistory]);

  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Live Chat</CardTitle>
        {accType !== "Attend" && <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          Start New Chat
        </Button>}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current">
          <TabsList className="w-full flex-1">
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
            {/* <ChatHistory></ChatHistory>
            <ChatInput></ChatInput> */}
            <LiveChat></LiveChat>
          </TabsContent>
          <TabsContent value="past" className="mt-4">
            {/* List past chats */}
          </TabsContent>
          <TabsContent value="upcoming" className="mt-4">
            {/* List upcoming chats */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
