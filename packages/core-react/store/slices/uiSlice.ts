import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  composerOpen: boolean;
  activeChatId: string | null;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
}

const initialState: UiState = {
  composerOpen: false,
  activeChatId: null,
  sidebarCollapsed: false,
  theme: 'system',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setComposerOpen: (state, action: PayloadAction<boolean>) => {
      state.composerOpen = action.payload;
    },
    setActiveChatId: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    resetUi: () => initialState,
  },
});

export const { setComposerOpen, setActiveChatId, setSidebarCollapsed, setTheme, resetUi } =
  uiSlice.actions;
