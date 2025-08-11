import { createSlice } from "@reduxjs/toolkit";

export interface UiState { composerOpen: boolean }
const initialState: UiState = { composerOpen: true };

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setComposerOpen(state, action: { payload: boolean }) {
      state.composerOpen = action.payload;
    }
  }
});
export const { setComposerOpen } = uiSlice.actions;
export default uiSlice.reducer;
