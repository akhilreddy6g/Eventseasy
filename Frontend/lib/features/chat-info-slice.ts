import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatInfo {
    chatId: string
    chatName: string
    chatDescription: string
    chatType: string
    chatDate: string
    chatStartTime: string
    chatEndTime: string
    chatStatus: boolean
    restrictedUsers: string []
}
export interface EventChats {
    eventId: string
    details: ChatInfo []
}

const chatInfoState = {
    newChat: false,
    chats: [] as EventChats []
};

export const chatInfoSlice = createSlice({
    name: "chats",
    initialState: chatInfoState,
    reducers: {
        onNewChat: (state) => {
            return {...state, newChat: !state.newChat}
        },

        onNewEventChatsFetch: (state, action: PayloadAction<EventChats []>) => {
            const index = state.chats.findIndex(chat => chat.eventId === action.payload[0].eventId);
            
            if (index !== -1) {
                state.chats[index].details = action.payload[0]?.details;
            } else {
                state.chats.push(action.payload[0]);
            }
        }
    }
})

export const {onNewChat, onNewEventChatsFetch} = chatInfoSlice.actions
export default chatInfoSlice.reducer