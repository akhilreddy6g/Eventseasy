import { Events, MessageBody, ServerMessageBody } from "@/components/dashboard/chat/chat-input";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const chatState = {
  msgHistory: [] as Events [],
  connectionFlag: true,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState: chatState,
  reducers: {
    onInitialMsgsFetch: (state, action: PayloadAction<ServerMessageBody>) => {
      state.msgHistory.push({
        eventId: action.payload.eventId,
        chats: [
          {
            chatId: action.payload.chatId,
            messages: action.payload.messages,
          },
        ],
      })
      return { ...state };
    },

    onNewMessage: (state, action: PayloadAction<MessageBody>) => {
      const { eventId, chatId, username, messageId, message, isUser, timestamp } = action.payload;
      let event = state.msgHistory.find((prev) => prev.eventId === eventId);

      if (!event) {
        state.msgHistory.push({
          eventId,
          chats: [
            {
              chatId,
              messages: [
                { username, messageId, message, isUser, timestamp }
              ]
            }
          ]
        });
      } else {
        let chat = event.chats.find((c) => c.chatId === chatId);
        if (!chat) {
          event.chats.push({
            chatId,
            messages: [
              { username, messageId, message, isUser, timestamp }
            ]
          });
        } else {
          chat.messages.push({ username, messageId, message, isUser, timestamp });
        }
      }
    },

    onChatCompRender: (state) => {
      return { ...state, connectionFlag: false };
    },
  },
});

export const { onNewMessage, onInitialMsgsFetch, onChatCompRender } = chatSlice.actions;
export default chatSlice.reducer;
