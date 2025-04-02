'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatInput from './chat-input';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import { mockChat2 } from '@/public/mockData';
import MessageCard from './message-card';
import { useAppSelector } from '@/lib/store';
import { ChatInfo } from '@/lib/features/chat-info-slice';
import { chatTypes, EventSelectedInChatTab } from './chat-tabs';
import { CirclePlay, Plus } from 'lucide-react';
import { InfoCircle } from '@mynaui/icons-react';

export interface Message {
  messageId: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface EventChat {
  chatId: string;
  chatName: string;
  members: number;
  messages: Message[];
}

export const chatMockData: EventChat[] = mockChat2

export function chatOptions(num: number) {
  return (
    <div className='flex gap-3 justify-between items-center'>
      <button className='px-3 py-1 text-xs font-medium rounded-md  bg-yellow-100 text-yellow-600'>Enter Chat</button>
      <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className='bg-green-600 hover:bg-green-600 text-xs font-medium py-1 px-3 rounded-md cursor-default'>{num}</button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Members in Live Chat</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    </div>
  )
}

export function DefaultChat({ chatId, userInChat, accType, chatStatus, chatTab, empty }: 
  { chatId: string, userInChat: boolean, accType: string, chatStatus: boolean, chatTab: string, empty: boolean }) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-2">
      {empty ? (
        <>
        {chatTab === "past" && <button className="flex gap-2 pl-16 text-md bg-gray-500 text-white rounded-sm p-[1px] w-64 items-center shadow-md">
        <InfoCircle className="w-7 h-7 pl-2 pr-1" /> View Details
      </button>}
        <p className="italic text-muted-foreground">
          {chatTab === "current" ? "No Messages Yet" : chatTab === "past" ? "No Messages to Show" : ""}
        </p>
        </>
      ) : (
        <>
          {accType === "Attend" && chatTab === "current" && !userInChat && chatStatus && (
            <button className="flex gap-2 pl-16 text-md bg-green-600 text-white rounded-sm p-[1px] w-64 items-center shadow-md">
              <Plus className="w-7 h-7 pl-2 pr-1" /> Join Chat
            </button>
          )}
          {(accType === "Host" || accType === "Manage") && chatTab === "current" && !userInChat && (
            <button className="flex gap-2 pl-16 text-md bg-green-600 text-white rounded-sm p-[1px] w-64 items-center shadow-md">
              <CirclePlay className="w-7 h-7 pl-2 pr-1" /> Start Chat
            </button>
          )}
          <button className="flex gap-2 pl-16 text-md bg-gray-500 text-white rounded-sm p-[1px] w-64 items-center shadow-md">
            <InfoCircle className="w-7 h-7 pl-2 pr-1" /> View Details
          </button>
          {(!chatStatus || chatTab === "upcoming") && (
            <p className="italic text-muted-foreground">
              {accType === "Host" || accType === "Manage" ? (<>Hit <span className="font-extrabold">Start Chat</span> to begin the Live Session</>) : (<>Chat <span className='font-extrabold'>Not Live Yet!</span> Stay Tuned</>)}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function calcTime(offset: number): Date {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * offset);
}

export function InfoTab({message}:{message: string}){
  return (
    <div className="flex flex-1 justify-center bg-white text-sm w-full sticky top-0 z-10 py-2 px-4 border-b-[1px]">{message}</div>
  )
}

export function ChatHeader({ chatHeading, changeChatView, containerKey, memberCount, selectedChat, chatTab, index }: { chatHeading: string; changeChatView: any, containerKey: string, memberCount: number, selectedChat: EventSelectedInChatTab, chatTab: chatTypes, index: number }) {
  return (
    <div key={"chatHeader"+containerKey} className={`h-10 rounded-t-lg rounded-b-lg w-48 overflow-scroll flex justify-between shadow-md text-white px-4 mx-2 ${selectedChat[chatTab] === containerKey ? "bg-black" : "bg-white"}`}>
      <button className="flex-1 clear" onClick={()=>{changeChatView(containerKey)}}>
        <p className={`text-left ${selectedChat[chatTab] === containerKey ? "text-white" : "text-black"}`}>{chatHeading}</p>
      </button>
      {/* {chatOptions(memberCount)} */}
    </div>
  );
}

export function chatTypeCheck(estDate: Date, chatType: string, chatInfo: ChatInfo){
  const chatDate = new Date(chatInfo.chatDate + "T00:00:00-04:00")
  if(chatType === "past"){
    return chatDate.toDateString() !== estDate.toDateString() && chatDate < estDate
  } else if(chatType === "current"){
    return chatDate.toDateString() === estDate.toDateString()
  } else if (chatType === "upcoming"){
    return chatType === chatInfo.chatType && chatDate > estDate
  }
}


export const GeneralChat = ({eventId, chatTab, selectedChat, setSelectedChat, accType}: {eventId: string, chatTab: chatTypes, selectedChat: EventSelectedInChatTab, setSelectedChat: React.Dispatch<React.SetStateAction<EventSelectedInChatTab>>, accType: string}) => {
  const chatInfo = useAppSelector((state)=>state.chatsInfoReducer).chats.filter(chat=> chat.eventId===eventId)
  const chatSelected = chatInfo[0]?.details?.filter((chat: ChatInfo)=>chat.chatId===selectedChat[chatTab])[0]
  const chatData = chatMockData.find((chat) => chat.chatId === selectedChat[chatTab])?.messages ?? []
  const initRef = useRef(true);
  const changeSelectedChat = (chatId: string) => {
    setSelectedChat((prev: EventSelectedInChatTab)=>({...prev, [chatTab] : chatId}));
  };
  const [userName, setUserName] = useState<string | null>(useAppSelector((state)=> state.userLoginSliceReducer).userName);
  const estDate = calcTime(-4)

  useEffect(() => {
    if (typeof window !== 'undefined' && !userName && initRef.current) {
      const storedUserName = sessionStorage.getItem('userName');
      if (storedUserName) {
        setUserName(storedUserName);
        initRef.current = false;
      }
    }
  }, []);

  return (
    <div className="flex flex-1 bg-gray-50 rounded-md shadow-md">
      {Array.isArray(chatInfo?.[0]?.details) && chatInfo[0].details.length > 0 && chatInfo?.[0]?.details?.some((record: ChatInfo)=> chatTypeCheck(estDate, chatTab, record))?
      <>
       <div className='flex flex-col items-center my-2 overflow-scroll max-h-[450px]'>
        {chatInfo[0].details
          .filter((chat: ChatInfo) => chatTypeCheck(estDate, chatTab, chat))
          .map((chat: ChatInfo, index) => (
            <div key={chat.chatId ?? `fallback-key-${index}`} className="my-1">
              <ChatHeader
                chatHeading={chat.chatName}
                changeChatView={changeSelectedChat}
                containerKey={chat.chatId}
                memberCount={4}
                selectedChat={selectedChat}
                chatTab={chatTab}
                index={index}
              />
            </div>
          ))}
      </div>
      <Card key={`ChatCard_${selectedChat[chatTab]}`} className="flex flex-1 flex-col shadow-lg rounded-t-md rounded-b-md overflow-hidden my-2 mr-2 h-[450px]">
         <>
          <ScrollArea key={`ScrollArea_${selectedChat[chatTab]}`} className="flex flex-1 pb-2 overflow-y-auto">
              {chatTab !== "upcoming" && chatSelected?.userInChat && chatSelected?.chatStatus && <InfoTab message='Info Tab' key={`InfoTab_${selectedChat[chatTab]}`}></InfoTab>}
              {chatTab === "past" || chatSelected?.userInChat && chatSelected?.chatStatus ? chatData.length > 0 ?
              (chatData.map((message, index) => (
              <MessageCard
                key={`Message_${message.messageId}`}
                containerKey={`Message_${message.messageId}`}
                username={message.username}
                message={message.message}
                timestamp={message.timestamp}
                orientation={message.username === userName ? 1: 0}
                prev={index==0? false: message.username===chatData[index-1].username}
                last={index===chatData.length-1}
              />
              ))) : <DefaultChat chatId={chatSelected?.chatId} userInChat={false} accType={accType} chatStatus={chatSelected?.chatStatus} chatTab={chatTab} empty={true}></DefaultChat>
               : <DefaultChat chatId={chatSelected?.chatId} userInChat={false} accType={accType} chatStatus={chatSelected?.chatStatus} chatTab={chatTab} empty={false}></DefaultChat>}
          </ScrollArea>
          {chatTab === "current" && chatSelected?.userInChat && chatSelected?.chatStatus && <div key={`ChatInput_${selectedChat[chatTab]}`} className="p-2 flex items-center ">
            <ChatInput eventId={selectedChat[chatTab]}/>
          </div>}
        </>
      </Card>
      </>: <div className='flex flex-1 justify-center items-center text-sm py-2'><p className='italic text-muted-foreground'>No chats to show</p></div>}
  </div>
  );
};

export default GeneralChat;
