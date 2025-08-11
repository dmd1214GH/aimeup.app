import { configureStore } from "@reduxjs/toolkit";
import ui from "./uiSlice";

export const makeStore = () =>
  configureStore({ reducer: { ui }, devTools: process.env.NODE_ENV !== "production" });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
