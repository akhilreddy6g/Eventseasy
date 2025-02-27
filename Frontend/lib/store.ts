import { configureStore } from "@reduxjs/toolkit";
import initialSliceReducer from "./features/initial-slice";
import userLoginSliceReducer from "./features/user-slice";
import eventGuestsSliceReducer from "./features/guest-slice";
import eventManagersSliceReducer from "./features/manager-slice";
import chatMessageReducer from "./features/chat-slice";
import { TypedUseSelectorHook, useSelector } from "react-redux";

export const makeStore = () => {
  return configureStore({
    reducer: {
      initialSliceReducer,
      userLoginSliceReducer,
      eventGuestsSliceReducer,
      eventManagersSliceReducer,
      chatMessageReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
