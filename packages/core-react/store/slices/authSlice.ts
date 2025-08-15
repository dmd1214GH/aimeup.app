import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  preAuthMode: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  preAuthMode: false,
  loading: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    },
    setPreAuthMode: (state, action: PayloadAction<boolean>) => {
      state.preAuthMode = action.payload;
      if (action.payload) {
        state.isAuthenticated = true;
        state.loading = false;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.preAuthMode = false;
      state.loading = false;
    },
  },
});

export const { setUser, setPreAuthMode, setLoading, logout } = authSlice.actions;
