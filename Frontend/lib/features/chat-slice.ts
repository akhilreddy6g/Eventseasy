import { Events, MessageBody, ServerMessageBody } from "@/components/dashboard/chat/chat-input";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WsConnFlag {
  eventId: string;
  chats: ChatConnFlag[]
}

interface ChatConnFlag {
  chatId: string;
  connectionFlag: boolean
}

interface ChatCompRenderPayload {
  eventId: string;
  chatId: string;
  connectionFlag: boolean
}

const chatState = {
  msgHistory: [] as Events [],
  wsConnState: [] as WsConnFlag [],
};

export const chatSlice = createSlice({
  name: "chat",
  initialState: chatState,
  reducers: {
    onInitialMsgsFetch: (state, action: PayloadAction<ServerMessageBody>) => {
      const { eventId, chatId, messages, messageFetchFlag } = action.payload;
    
      // Check if the event already exists
      const existingEvent = state.msgHistory.find((event) => event.eventId === eventId);
    
      if (!existingEvent) {
        // If event doesn't exist, add new event with chat
        state.msgHistory.push({
          eventId,
          chats: [
            {
              chatId,
              messages,
              messageFetchFlag,
            },
          ],
        });
      } else {
        // Event exists, check if chat already exists
        const existingChat = existingEvent.chats.find((chat) => chat.chatId === chatId);
    
        if (!existingChat) {
          // Add new chat to existing event
          existingEvent.chats.push({
            chatId,
            messages,
            messageFetchFlag,
          });
        } else {
          // Chat exists — update messages and fetch flag
          existingChat.messages = messages;
          existingChat.messageFetchFlag = messageFetchFlag;
        }
      }
    },    

    onNewMessage: (state, action: PayloadAction<MessageBody>) => {
      const { eventId, chatId, username, messageId, message, user, timestamp } = action.payload;
      let event = state.msgHistory.find((prev) => prev.eventId === eventId);

      if (!event) {
        state.msgHistory.push({
          eventId,
          chats: [
            {
              chatId,
              messages: [
                { username, messageId, message, user, timestamp }
              ],
              messageFetchFlag: true
            }
          ]
        });
      } else {
        let chat = event.chats.find((c) => c.chatId === chatId);
        if (!chat) {
          event.chats.push({
            chatId,
            messages: [
              { username, messageId, message, user, timestamp }
            ],
            messageFetchFlag: true
          });
        } else {
          chat.messages.push({ username, messageId, message, user, timestamp });
        }
      }
    },

    onChatCompRender: (state, action: PayloadAction<ChatCompRenderPayload>) => {
      const { eventId, chatId, connectionFlag } = action.payload;
      let event = state.wsConnState.find((prev) => prev.eventId === eventId);
      if (!event) {
        state.wsConnState.push({
          eventId,
          chats: [
            { chatId, connectionFlag }
          ]
        });
      } else {
        let chat = event.chats.find((c) => c.chatId === chatId);
        if (!chat) {
          event.chats.push({
            chatId,
            connectionFlag
          });
        } else {
          chat.connectionFlag = connectionFlag;
        }
      }
    },
  },
});

export const { onNewMessage, onInitialMsgsFetch, onChatCompRender } = chatSlice.actions;
export default chatSlice.reducer;
