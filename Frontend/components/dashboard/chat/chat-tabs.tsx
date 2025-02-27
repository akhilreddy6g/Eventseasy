"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, History, Calendar } from "lucide-react";
import ChatInput from "./chat-input";
import { useEffect, useState } from "react";
import { ChatHistory } from "./chat-history";

export function ChatTabs() {
  const [chatHistory, setChatHistory] = useState([]);
  useEffect(() => {}, [chatHistory]);

  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Live Chat</CardTitle>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          Start New Chat
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current">
          <TabsList>
            <TabsTrigger value="past">
              <History className="mr-2 h-4 w-4" />
              Past Chats
            </TabsTrigger>
            <TabsTrigger value="current">
              <MessageSquare className="mr-2 h-4 w-4" />
              Current Chats
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              <Calendar className="mr-2 h-4 w-4" />
              Upcoming Chats
            </TabsTrigger>
          </TabsList>
          <TabsContent value="past" className="mt-4">
            {/* List past chats */}
          </TabsContent>
          <TabsContent value="current" className="mt-4">
            <ChatHistory></ChatHistory>
            <ChatInput></ChatInput>
          </TabsContent>
          <TabsContent value="upcoming" className="mt-4">
            {/* List upcoming chats */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
