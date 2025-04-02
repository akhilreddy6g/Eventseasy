"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, History, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import GeneralChat, { calcTime, chatTypeCheck } from "./chat-window";
import ChatForm from "./chat-form";
import { apiUrl } from "@/components/noncomponents";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/lib/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChatInfo, onNewEventChatsFetch } from "@/lib/features/chat-info-slice";

export interface EventSelectedInChatTab {
  current: string;
  past: string;
  upcoming: string;
}

export type chatTypes = "past" | "current" | "upcoming"

export function ChatTabs({accType, eventId}:{accType: string, eventId: string}) {
  const [newChat, toggleNewChat] = useState(false);
  const [newFutureChat, toggleNewFutureChat] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  const dispatch = useDispatch<AppDispatch>()
  const queryClient = useQueryClient()
  const eventState = useAppSelector((state=>state.chatsInfoReducer))
  const newChatState = eventState.newChat
  const [selectedChat, setSelectedChat] = useState<EventSelectedInChatTab>({past: "", current: "", upcoming: ""});

  const fetchData = async () => {
    try {
      const res = await apiUrl.get(`/chats/data?eventId=${eventId}`);
      const data : ChatInfo[] = res.data.success ? res.data.message : []
      return data
    } catch (error) {
      console.error("Error fetching data:", error);
      return []
    }
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["chats", newChatState, eventId],
    queryFn: fetchData,
    retry: false
  })

  useEffect(()=> {
    if(Array.isArray(data) && data.length > 0){
      console.log("entered into useffect, after checking array length is greater than 0")
      dispatch(onNewEventChatsFetch([{eventId:eventId, details: data as ChatInfo []}]));
      const estDate = calcTime(-4);
      const pastInitialChat = data.filter((chat: ChatInfo) => chatTypeCheck(estDate, "past", chat))?.[0]?.chatId || "";
      const currentInitialChat = data.filter((chat: ChatInfo) => chatTypeCheck(estDate, "current", chat))?.[0]?.chatId || "";
      const upcomingInitialChat = data.filter((chat: ChatInfo) => chatTypeCheck(estDate, "upcoming", chat))?.[0]?.chatId || "";
      setSelectedChat({
        past: pastInitialChat,
        current: currentInitialChat,
        upcoming: upcomingInitialChat,
      });
    }
  }, [data])

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
        <Button className={`${!newChat && "bg-yellow-100 text-yellow-600 hover:bg-yellow-100"} shadow-md`} onClick={() => toggleForm(0)}>
          <MessageSquare className={`mr-2 h-4 w-4`}/>
          <p>New Chat</p>
        </Button>
        <Button className={`${!newFutureChat && "bg-yellow-100 text-yellow-600 hover:bg-yellow-100"} shadow-md`} onClick={() => toggleForm(1)}>
          <div className={`mr-2 h-4 w-4 ${!newFutureChat && "bg-yellow-100 text-yellow-600"}`}><img src={`/images/${!newFutureChat ? "future-orange.png" : "future-white.png"}`} alt="future icon"/></div>
          <p>Plan Ahead</p>
        </Button>
        </div>}
      </CardHeader>
      <CardContent>
        <Tabs value={newChat || newFutureChat ? "" : activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex-1" onClick={()=> {toggleForm(2)}}>
            <TabsTrigger value="past" className="w-1/3">
              <History className="mr-2 h-4"/>
              Past Chats
            </TabsTrigger>
            <TabsTrigger value="current" className="w-1/3">
              <MessageSquare className="mr-2 h-4" />
              Current Chats
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="w-1/3">
              <Calendar className="mr-2 h-4" />
              Upcoming Chats
            </TabsTrigger>
          </TabsList>
          <TabsContent value="past" className="my-4">
            <GeneralChat eventId={eventId} selectedChat={selectedChat} setSelectedChat={setSelectedChat} chatTab="past" accType={accType}></GeneralChat>
          </TabsContent>
          <TabsContent value="current" className="my-4">
            <GeneralChat eventId={eventId} selectedChat={selectedChat} setSelectedChat={setSelectedChat} chatTab="current" accType={accType}></GeneralChat>
          </TabsContent>
          <TabsContent value="upcoming" className="my-4">
            <GeneralChat eventId={eventId} selectedChat={selectedChat} setSelectedChat={setSelectedChat} chatTab="upcoming" accType={accType}></GeneralChat>
          </TabsContent>
        </Tabs>
        {newChat && <ChatForm newFutureChat={false} eventId={eventId}></ChatForm>}
        {newFutureChat && <ChatForm newFutureChat={true} eventId={eventId}></ChatForm>}
      </CardContent>
    </Card>
  );
}
