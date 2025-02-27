import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const chatState = {
  chats: [] as string[],
  connectionFlag: true,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState: chatState,
  reducers: {
    onNewMessage: (state, action: PayloadAction<string>) => {
      return { ...state, chats: [...state.chats, action.payload] };
    },

    onChatCompRender: (state) => {
      return { ...state, connectionFlag: false };
    },
  },
});

export const { onNewMessage, onChatCompRender } = chatSlice.actions;
export default chatSlice.reducer;
