import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState } from "./types";
import { apiLogin, apiRegister } from "@/lib/authApi";
import type { LoginRequest, RegisterRequest } from "@/lib/authApi";

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  user: null,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (req: LoginRequest, { rejectWithValue }) => {
    try {
      return await apiLogin(req);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (req: RegisterRequest, { rejectWithValue }) => {
    try {
      return await apiRegister(req);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Registration failed");
    }
  }
);

function persistAuth(token: string, user: { userId: string; email: string; fullName: string; roles: string[] }) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    localStorage.setItem("authUser", JSON.stringify(user));
  }
}

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
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("authUser");
      }
    },
    loadTokenFromStorage(state) {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("authUser");
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
        }
        if (userStr) {
          try {
            state.user = JSON.parse(userStr);
          } catch {
            // ignore malformed data
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        const { accessToken, userId, email, fullName, roles } = action.payload;
        state.token = accessToken;
        state.isAuthenticated = true;
        state.user = { userId, email, fullName, roles };
        persistAuth(accessToken, { userId, email, fullName, roles });
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const { accessToken, userId, email, fullName, roles } = action.payload;
        state.token = accessToken;
        state.isAuthenticated = true;
        state.user = { userId, email, fullName, roles };
        persistAuth(accessToken, { userId, email, fullName, roles });
      });
  },
});

export const { setToken, clearToken, loadTokenFromStorage } = authSlice.actions;
export default authSlice.reducer;
