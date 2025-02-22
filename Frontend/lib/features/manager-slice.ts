import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Guest } from "@/components/dashboard/guests/view-guests";

const managerState = {
    eventManagers: [] as Guest [],
    managersAdded: false
  };

export const managerSlice = createSlice({
    name: "managers",
    initialState: managerState,
    reducers: {
        onManagersLoad: (state, action: PayloadAction<Guest []>) => {
            return {...state, eventManagers: action.payload}
        },

        onNewInvite: (state) => {
            return {...state, managersAdded: !state.managersAdded}
        }
    }
});

export const {onManagersLoad, onNewInvite} = managerSlice.actions
export default managerSlice.reducer
