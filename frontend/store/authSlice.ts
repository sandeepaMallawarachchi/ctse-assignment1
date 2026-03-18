import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, AuthUser } from "./types";
import {
  apiGetCurrentUser,
  apiIssueToken,
  apiLogin,
  apiRegister,
  apiUpdateAddress,
  apiUpdateProfile,
} from "@/lib/authApi";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateAddressRequest,
  UpdateProfileRequest,
} from "@/lib/authApi";

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

export const fetchAuthFromCookie = createAsyncThunk(
  "auth/fetchAuthFromCookie",
  async (_, { rejectWithValue }) => {
    try {
      return await apiIssueToken();
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Google login failed");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: AuthState };
    if (!auth.token) {
      return rejectWithValue("Not authenticated");
    }

    try {
      return await apiGetCurrentUser(auth.token);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to load profile");
    }
  }
);

export const saveProfile = createAsyncThunk(
  "auth/saveProfile",
  async (req: UpdateProfileRequest, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: AuthState };
    if (!auth.token) {
      return rejectWithValue("Not authenticated");
    }

    try {
      return await apiUpdateProfile(auth.token, req);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to save profile");
    }
  }
);

export const saveAddress = createAsyncThunk(
  "auth/saveAddress",
  async (req: UpdateAddressRequest, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: AuthState };
    if (!auth.token) {
      return rejectWithValue("Not authenticated");
    }

    try {
      return await apiUpdateAddress(auth.token, req);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to save address");
    }
  }
);

function toAuthUser(payload: AuthResponse): AuthUser {
  return {
    firstName: payload.firstName,
    lastName: payload.lastName,
    userId: payload.userId,
    email: payload.email,
    phoneNumber: payload.phoneNumber ?? null,
    address: payload.address ?? null,
    fullName: payload.fullName,
    roles: payload.roles,
  };
}

function persistAuth(token: string, user: AuthUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    localStorage.setItem("authUser", JSON.stringify(user));
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<AuthResponse>) {
      const { accessToken } = action.payload;
      const user = toAuthUser(action.payload);
      state.token = accessToken;
      state.isAuthenticated = true;
      state.user = user;
      persistAuth(accessToken, user);
    },
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
    updateAuthUser(state, action: PayloadAction<{ fullName: string }>) {
      if (!state.user) return;
      const nameParts = action.payload.fullName.trim().split(/\s+/).filter(Boolean);

      state.user = {
        ...state.user,
        firstName: nameParts[0] ?? state.user.firstName,
        lastName: nameParts.slice(1).join(" ") || state.user.lastName,
        fullName: action.payload.fullName,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("authUser", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        const { accessToken } = action.payload;
        const user = toAuthUser(action.payload);
        state.token = accessToken;
        state.isAuthenticated = true;
        state.user = user;
        persistAuth(accessToken, user);
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const { accessToken } = action.payload;
        const user = toAuthUser(action.payload);
        state.token = accessToken;
        state.isAuthenticated = true;
        state.user = user;
        persistAuth(accessToken, user);
      })
      .addCase(fetchAuthFromCookie.fulfilled, (state, action) => {
        const { accessToken } = action.payload;
        const user = toAuthUser(action.payload);
        state.token = accessToken;
        state.isAuthenticated = true;
        state.user = user;
        persistAuth(accessToken, user);
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        const user = toAuthUser(action.payload);
        state.user = user;
        if (state.token) {
          persistAuth(state.token, user);
        }
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        const user = toAuthUser(action.payload);
        state.user = user;
        if (state.token) {
          persistAuth(state.token, user);
        }
      })
      .addCase(saveAddress.fulfilled, (state, action) => {
        const user = toAuthUser(action.payload);
        state.user = user;
        if (state.token) {
          persistAuth(state.token, user);
        }
      });
  },
});

export const { setAuth, setToken, clearToken, loadTokenFromStorage, updateAuthUser } = authSlice.actions;
export default authSlice.reducer;
