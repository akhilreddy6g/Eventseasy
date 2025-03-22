'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatInput from './chat-input';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import { mockChat2 } from '@/public/mockData';
import MessageCard from './message-card';
import { useAppSelector } from '@/lib/store';
import { ChatInfo } from '@/lib/features/chat-info-slice';

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

export const LiveChat = ({eventId}: {eventId: string}) => {
  const [selectedChat, setSelectedChat] = useState<string>(chatMockData[0].chatId);
  const chatInfo = useAppSelector((state)=>state.chatsInfoReducer).chats.filter(chat=> chat.eventId===eventId)
  const changeSelectedChat = (chatId: string) => {
    setSelectedChat(chatId);
  };

  function ChatHeader({ chatHeading, changeChatView, containerKey, memberCount }: { chatHeading: string; changeChatView: any, containerKey: string, memberCount: number }) {
    return (
      <div key={"chatHeader"+containerKey} className={`h-10 rounded-t-lg rounded-b-lg w-48 overflow-scroll flex justify-between shadow-md text-white px-4 mx-2 ${selectedChat === containerKey ? "bg-black" : "bg-white"}`}>
        <button className="flex-1 clear" onClick={()=>{changeChatView(containerKey)}}>
          <p className={`text-left ${selectedChat === containerKey ? "text-white" : "text-black"}`}>{chatHeading}</p>
        </button>
        {/* {chatOptions(memberCount)} */}
      </div>
    );
  }

  function InfoTab({message}:{message: string}){
    return (
      <div className="flex flex-1 justify-center bg-white text-sm w-full sticky top-0 z-10 py-2 px-4 border-b-[1px]">{message}</div>
    )
  }

  return (
    <div className="flex flex-1 bg-gray-50 rounded-md shadow-md">
      <div className='flex flex-col items-center my-2 overflow-scroll max-h-[450px]'>
        {chatInfo?.[0]?.details?.map((chat: ChatInfo, index) => (
        <div key={chat?.chatId} className="my-1">
          <ChatHeader
            chatHeading={chat?.chatName}
            changeChatView={changeSelectedChat}
            containerKey={chat?.chatId}
            memberCount={4}
          />
        </div>
      ))}
      </div>
      <Card key={`ChatCard_${selectedChat}`} className="flex flex-1 flex-col shadow-lg rounded-t-md rounded-b-md overflow-hidden my-2 mr-2 max-h-[450px]">
          <ScrollArea key={`ScrollArea_${selectedChat}`} className="flex flex-1 pb-2 overflow-y-auto">
              <InfoTab message='Info Tab' key={`InfoTab_${selectedChat}`}></InfoTab>
              {(chatMockData.find((chat) => chat.chatId === selectedChat)?.messages ?? []).map((message, index) => (
              <MessageCard
                key={`Message_${message.messageId}`}
                containerKey={`Message_${message.messageId}`}
                username={message.username}
                message={message.message}
                timestamp={message.timestamp}
                orientation={index % 2}
              />
            ))}
          </ScrollArea>
          <div key={`ChatInput_${selectedChat}`} className="p-2 flex items-center ">
            <ChatInput eventId={selectedChat}/>
          </div>
      </Card>
  </div>
  );
};

export default LiveChat;
