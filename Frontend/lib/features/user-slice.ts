import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const userState = {
    user: ""
  };

export const userSlice = createSlice({
    name: "userCredentials",
    initialState: userState,
    reducers: {
        onLogIn: (state, action: PayloadAction<string>) => {
            return {...state, user: action.payload}
        }
    }
});

export const {onLogIn} = userSlice.actions
export default userSlice.reducer
