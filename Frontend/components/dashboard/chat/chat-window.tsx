'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatHistory } from './chat-history';
import ChatInput from './chat-input';

interface Message {
  sender: string;
  text: string;
  timestamp: string;
}

const LiveChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      sender: 'User', // Replace with dynamic sender info if available
      text: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
  };

  return (
    <Card className="w-[370px] h-[450px] flex flex-col border border-gray-200 shadow-lg">
      <ScrollArea className="flex-1 p-2 space-y-2 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="p-2 rounded-md bg-gray-100">
            <p className="text-xs font-semibold text-gray-700">{msg.sender}</p>
            <p className="text-sm">{msg.text}</p>
            <p className="text-[10px] text-gray-500">{msg.timestamp}</p>
          </div>
        ))}
         <ChatHistory></ChatHistory>
      </ScrollArea>
      <div className="p-2 flex items-center">
        <ChatInput></ChatInput>
      </div>
    </Card>
  );
};

export default LiveChat;
