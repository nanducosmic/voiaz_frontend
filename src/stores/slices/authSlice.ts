import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '@/services/api';

// --- TYPES ---
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  balance: number;
  tenant_id: string; // Crucial: required for KB training
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Matches your actual backend response structure exactly
interface AuthResponse {
  token: string;
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  balance: number;
  tenant_id: string; // Received from backend login controller
}

// --- STORAGE HELPERS ---
const getStoredData = () => {
  if (typeof window === 'undefined') return { user: null, token: null };
  
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (!token || token === "undefined" || token === "null") {
    return { user: null, token: null };
  }

  try {
    return {
      token,
      user: userData && userData !== "undefined" ? JSON.parse(userData) : null
    };
  } catch (error) {
    console.error("Failed to parse stored user data:", error);
    return { user: null, token: null };
  }
};

const stored = getStoredData();

const initialState: AuthState = {
  user: stored.user,
  token: stored.token,
  isAuthenticated: !!stored.token,
  loading: false,
  error: null,
};

// --- ASYNC THUNKS ---

// 1. LOGIN
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await API.post<AuthResponse>('/auth/login', credentials);

      // Destructure fields from the backend response
      const { token, _id, name, email, role, balance, tenant_id } = response.data;

      // Map backend _id to frontend id and include tenant_id
      const user: User = {
        id: _id,
        name,
        email,
        role,
        balance,
        tenant_id, // Preserving the tenant_id for the project logic
        createdAt: new Date().toISOString(), 
      };

      if (!token || !user.id) {
        throw new Error("Invalid response from server");
      }

      return { token, user };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

// 2. REGISTER
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await API.post<AuthResponse>('/auth/register', userData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

// --- SLICE ---
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;

        // PERSISTENCE: Now includes the full user object with tenant_id
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;