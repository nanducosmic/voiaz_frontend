import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '@/services/api'; 

// --- TYPES ---
interface User {
  id: string;
  email: string;
  role: 'superadmin' | 'admin';
  tenant_id?: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface LoginResponse {
  token: string;
  user: User;
}

// ✅ FIX: Safe parsing to handle "undefined" strings in localStorage
const getStoredData = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  // If the browser literally stored the word "undefined" as a string, treat it as null
  if (!token || token === "undefined") return { user: null, token: null };
  
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

// --- THE ASYNC THUNK ---
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await API.post<LoginResponse>('/auth/login', credentials);
      const { token, user } = response.data;
      
      // ✅ Check if data actually exists before saving
      if (!token || !user) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.isAuthenticated = true; 
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null; // Reset on failure
        state.token = null;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;