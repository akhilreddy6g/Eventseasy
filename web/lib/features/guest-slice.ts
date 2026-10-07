import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Guest } from "@/components/dashboard/guests/view-guests";

const guestState = {
    eventGuests: [] as Guest [],
    inviteAcceptedGuests: [] as Guest[],
    inviteResponsePendingGuests: [] as Guest[],
    guestsAdded: false
  };

export const guestSlice = createSlice({
    name: "guests",
    initialState: guestState, 
    reducers: {
        onGuestsLoad: (state, action: PayloadAction<Guest []>) => {
            return {...state, eventGuests: action.payload}
        },

        onInvitedGuestsLoad: (state, action: PayloadAction<Guest []>) => {
            return {...state ,inviteAcceptedGuests: action.payload}
        },

        onInviteResponsePendingGuestsLoad: (state, action: PayloadAction<Guest []>) => {
            return {...state, inviteResponsePendingGuests: action.payload}
        },

        onNewGuestInvite: (state) => {
            return {...state, guestsAdded: !state.guestsAdded}
        }
    }
});

export const {onGuestsLoad, onInvitedGuestsLoad, onInviteResponsePendingGuestsLoad, onNewGuestInvite} = guestSlice.actions
export default guestSlice.reducer
