import axios from "axios";

// Vite automatically handles environment detection. 
// It will use the .env value if available, otherwise it falls back to the production URL.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://bolnabackend1-production.up.railway.app/api";

const API = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Token to every request (Keeps you logged in)
API.interceptors.request.use((config) => {
  // Logic check: Try to get from 'auth' state or localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Some structures store token inside a nested 'user' object, others directly.
  // This check covers both.
  const token = user?.token || localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// The "Safe" Interceptor (Handles logout/unauthorized)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized attempt to:", error.config.url);
      // Optional: Redirect to login or clear localStorage here
      // localStorage.removeItem('user');
      // window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

/* --- AUTH EXPORTS (Add these so you can use them in authSlice) --- */
export const login = (credentials: any) => API.post("/auth/login", credentials);
export const register = (data: any) => API.post("/auth/register", data);

/* --- CORE FEATURE EXPORTS --- */
export const getDashboardStats = () => API.get("/dashboard/stats");
export const getContactsSummary = () => API.get("/call-logs/summary");
export const initiateCalls = (data: { prompt: string; gender: string }) => API.post("/calls/initiate", data);
export const saveAgent = (data: { name: string; prompt: string }) => API.post("/agent", data);
export const getAgent = () => API.get("/agent");
export const importContacts = (contacts: string) => API.post("/contacts/import/text", { contacts });
export const getCallStats = () => API.get("/call-logs/stats");
export const syncCallResults = () => API.post("/call-logs/sync");
export const getFullHistory = (page = 1) => API.get(`/call-logs/history?page=${page}&limit=20`);
export const getSystemStatus = () => API.get("/system-status");

/* --- CAMPAIGN EXPORTS --- */
export const triggerCampaign = (data: { type: string }) => API.post("/trigger-campaign", data);

/* --- BILLING & INTEGRATIONS EXPORTS --- */
export const getBalance = () => API.get("/billing/balance");
export const createRechargeSession = (amount: number) => API.post("/billing/recharge", { amount });
export const connectCalendar = () => API.get("/integrations/google-calendar/auth");
export const getCalendarStatus = () => API.get("/integrations/google-calendar/status");
export const getCredits = () => API.get('/credits/balance');
export const getTransactionHistory = () => API.get('/credits/history');
export const getAllTenants = () => API.get('/tenants');
export const getAdminStats = () => API.get('/dashboard/stats'); 

export default API;