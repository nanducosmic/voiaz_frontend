import axios from "axios";

// This checks if you are running locally (development) or on the server (production)
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Toggle between your local Express server and Railway
const API_BASE = isLocal 
  ? "http://localhost:5000/api" 
  : "https://bolnabackend1-production.up.railway.app/api";

const API = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Token to every request (Keeps you logged in)
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// The "Safe" Interceptor (Handles logout/unauthorized)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized attempt to:", error.config.url);
    }
    return Promise.reject(error);
  }
);

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

/* --- CAMPAIGN EXPORTS (The missing piece) --- */
export const triggerCampaign = (data: { type: string }) => API.post("/trigger-campaign", data);

/* --- BILLING & INTEGRATIONS EXPORTS --- */
export const getBalance = () => API.get("/billing/balance");
export const createRechargeSession = (amount: number) => API.post("/billing/recharge", { amount });
export const connectCalendar = () => API.get("/integrations/google-calendar/auth");
export const getCalendarStatus = () => API.get("/integrations/google-calendar/status");
export const getCredits = () => API.get('/credits/balance');
export const getTransactionHistory = () => API.get('/credits/history');
export const getAllTenants = () => API.get('/tenants');
export const getAdminStats = () => API.get('/dashboard/stats'); // Adjust based on your actual admin route
export default API;