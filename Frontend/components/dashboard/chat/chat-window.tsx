'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatHistory } from './chat-history';
import ChatInput from './chat-input';
import { Badge } from "@/components/ui/badge"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import { chatData } from '@/public/mockData';

export interface Message {
  messageId: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface EventChat {
  eventId: string;
  eventName: string;
  members: number;
  messages: Message[];
}

export const chatMockData: EventChat[] = chatData

export function MessageCard({
  containerKey,
  username,
  message,
  timestamp,
  orientation
}: {
  containerKey: string
  username: string;
  message: string;
  timestamp: string;
  orientation: number
}) {
  return (
    <div key={"MessageCardContainer"+containerKey} className={`flex ${orientation=== 0 ? "justify-start" : "justify-end"} w-full`}>
    { orientation === 0 ?
        <div key={"MessageCard"+containerKey} className="flex items-center space-x-3 w-3/4 justify-start">
          <div className="flex-shrink-0 bg-gray-300 h-10 w-10 rounded-full flex items-center justify-center text-gray-700 font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-col w-fit items-start justify-start">
              <p className="mt-3 p-2 w-fit text-gray-700 bg-white shadow-lg rounded-2xl border border-gray-200 text-justify">{message}</p>
              <div className='flex justify-between w-full p-2'>
                <h4 className="font-semibold text-gray-800 min-w-min">{username}</h4>
                <p className="text-sm text-gray-500">{timestamp}</p>
              </div>
            </div>
          </div>
        </div>
        : 
        <div key={"MessageCard"+containerKey} className="flex items-center space-x-3 w-3/4 justify-end">
          <div>
          <div className="flex flex-col w-fit items-end justify-end">
            <p className="mt-3 p-2 w-fit text-gray-700 bg-white shadow-lg rounded-2xl border border-gray-200 text-justify">
              {message}
            </p>
            <div className="flex justify-between w-full p-2">
              <p className="text-sm text-gray-500">{timestamp}</p>
              <h4 className="font-semibold text-gray-800 min-w-min">{username}</h4>
            </div>
          </div>
          </div>
          <div className="flex-shrink-0 bg-gray-300 h-10 w-10 rounded-full flex items-center justify-center text-gray-700 font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
    }
    </div>
  );
}

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

export const LiveChat = () => {
  const [chatExpand, setChatExpand] = useState(false)
  const [expandedChats, setExpandedChats] = useState<Record<string, boolean>>({});
  const toggleExpand = (chatId: string) => {
    setExpandedChats((prev) => ({
      ...prev,
      [chatId]: !prev[chatId],
    }));
  };

function ChatHeader({ chatHeading, toggleExpand, containerKey, memberCount }: { chatHeading: string; toggleExpand: () => void, containerKey: string, memberCount: number }) {
  return (
    <div key={"chatHeader"+containerKey} className={`h-10 rounded-t-xl ${expandedChats[containerKey] ? '' : 'rounded-b-xl'} flex justify-between items-center bg-white shadow-md text-white px-4 mx-2`}>
      <button className="flex-1 clear" onClick={toggleExpand}>
        <p className="text-left text-black overflow-ellipsis">{chatHeading}</p>
      </button>
      {chatOptions(memberCount)}
    </div>
  );
}

  return (
    <div className="flex-1 flex-col bg-gray-50 rounded-md shadow-md h-fit max-h-96 overflow-scroll">
    {chatMockData.map((chat) => (
      <div key={chat.eventId} className="my-4">
        <ChatHeader
          chatHeading={chat.eventName}
          toggleExpand={() => toggleExpand(chat.eventId)}
          containerKey={chat.eventId}
          memberCount={chat.members}
        />
        {expandedChats[chat.eventId] && (
          <Card key={`ChatCard_${chat.eventId}`} className="flex flex-col h-[450px] shadow-lg rounded-t-none rounded-b-md overflow-hidden px-4 mx-2 border-x-0">
            <ScrollArea key={`ScrollArea_${chat.eventId}`} className="flex-1 p-2 space-y-2 overflow-y-auto">
              {chat.messages.map((message, index) => (
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
            <div key={`ChatInput_${chat.eventId}`} className="p-2 flex items-center">
              <ChatInput eventId={chat.eventId}/>
            </div>
          </Card>
        )}
      </div>
    ))}
  </div>
  );
};

export default LiveChat;
