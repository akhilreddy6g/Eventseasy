import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { userEvents } from "@/components/dashboard/sidebar";

const initialState = {
    eventState: false,
    userData: [] as userEvents[]
  };

export const initialSlice = createSlice({
    name: "user",
    initialState: initialState,
    reducers: {
        onAddNewEvent: (state) => {
            return {...state ,eventState: !state.eventState}
        },

        onInitialLogIn: (state, action: PayloadAction<userEvents []>) => {
            return {...state, userData: action.payload}
        }
    }
});

export const {onAddNewEvent, onInitialLogIn} = initialSlice.actions
export default initialSlice.reducer
