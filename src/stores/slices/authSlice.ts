import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '@/services/api';

// --- TYPES ---
interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  balance: number;
  tenant_id: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// This matches your actual backend response structure
interface AuthResponse {
  token: string;
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  balance: number;
  tenant_id: string;
}

// --- STORAGE HELPERS ---
const getStoredData = () => {
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

      // Destructure token, _id, name, email, role, balance, and tenant_id from the response
      const { token, _id, name, email, role, balance, tenant_id } = response.data;

      // Map the backend _id to the frontend id
      const user: User = {
        id: _id,
        name,
        email,
        role,
        balance,
        tenant_id,
        createdAt: new Date().toISOString(), // Assuming createdAt is not in login response, set current time or handle accordingly
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
      // We do NOT save to localStorage here so they are forced to log in
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
        // Persistence: save the token and the user object (stringified) to localStorage
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