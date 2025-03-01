import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const userState = {
    user: "",
    userName: ""
  };

export const userSlice = createSlice({
    name: "userCredentials",
    initialState: userState,
    reducers: {
        onLogIn: (state, action: PayloadAction<{user: string, userName: string}>) => {
            return {...state, user: action.payload.user, userName: action.payload.userName}
        }
    }
});

export const {onLogIn} = userSlice.actions
export default userSlice.reducer
