import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState } from "./types";

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload);
      }
    },
    clearToken(state) {
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
    loadTokenFromStorage(state) {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
        }
      }
    },
  },
});

export const { setToken, clearToken, loadTokenFromStorage } = authSlice.actions;
export default authSlice.reducer;
