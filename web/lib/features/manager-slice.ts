import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Manager } from "@/components/dashboard/managers/view-managers";

const managerState = {
    eventManagers: [] as Manager [],
    managersAdded: false
  };

export const managerSlice = createSlice({
    name: "managers",
    initialState: managerState,
    reducers: {
        onManagersLoad: (state, action: PayloadAction<Manager []>) => {
            return {...state, eventManagers: action.payload}
        },

        onNewManagerInvite: (state) => {
            return {...state, managersAdded: !state.managersAdded}
        }
    }
});

export const {onManagersLoad, onNewManagerInvite} = managerSlice.actions
export default managerSlice.reducer
