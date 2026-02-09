export const getTenants = () => API.get('/tenants');
export const updateUserTenant = (userId: string, tenantId: string) => API.patch(`/admin/sub-users/${userId}/tenant`, { tenant_id: tenantId });
// Create a new user with tenant_id
export const createUser = (userData: { name: string; email: string; role: string; balance: number; isActive: boolean; tenant_id: string }) =>
  API.post('/admin/users', userData);
// Toggle user status (active/inactive)
export const toggleUserStatus = (userId: string) => 
  API.patch(`/admin/sub-users/${userId}/status`);
// Fetch all admin users (for UserTable 'All Tenants' view)
export const getAdminUsers = () => API.get('/admin/sub-users');
// Fetch all sub-users (for UserTable 'All Tenants' view)
export const getAllSubUsers = () => API.get('/sub-users');
import axios from "axios";

// Easily switch between local and Railway backend:
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://bolnabackend1-production.up.railway.app/api';
// To use Railway backend, set VITE_API_BASE_URL to 'https://bolnabackend1-production.up.railway.app/api' in your .env file.

const API = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Token and X-Tenant-ID to every request (Keeps you logged in and multi-tenant aware)
API.interceptors.request.use((config) => {
  // Attach Authorization token
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = user?.token || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Attach X-Tenant-ID for multi-tenancy
  // Priority: user.tenant_id > selectedTenantId
  if (user?.tenant_id) {
    config.headers['X-Tenant-ID'] = user.tenant_id;
  } else {
    const tenantId = localStorage.getItem('selectedTenantId');
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    } else {
      delete config.headers['X-Tenant-ID'];
    }
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

/* --- CONTACT MANAGEMENT EXPORTS --- */
// Change this in your api.ts
export const getContacts = (params?: { list_id?: string }) => 
  API.get('/contacts', { params });
export const bulkImportContacts = (contacts: { name: string; phone: string }[]) => API.post('/contacts/bulk', { contacts });
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
export const getAdminStats = () => API.get('/admin/stats');
export const getClientStats = () => API.get('/client/stats'); 
export const updateUserPhone = (userId: string, phoneNumber: string) => API.put(`/users/${userId}/phone`, { phoneNumber });
export const updateUserBalance = (userId: string, balance: number) => API.patch(`/admin/sub-users/${userId}/balance`, { balance });

// Keep your existing ones, but add these for the Super Admin History Page
export const getAdminFullHistory = (page = 1) => 
  API.get(`/admin/all-calls?page=${page}&limit=20`); 

export const adminSyncCallResults = () => 
  API.post("/admin/call-logs/sync");

// Add these to your API.ts file
export const getContactLists = () => API.get('/contacts/lists');
export const createContactList = (data: { name: string, description?: string }) => API.post('/contacts/lists', data);
export const importExcelContacts = (formData: FormData) => API.post('/contacts/import/excel', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const startCampaign = (data: { list_id: string, agent_id: string }) => 
  API.post('/campaigns/start', data);
// Fix getContactListById endpoint (plural path)
export const getContactListById = (id: string) => API.get('/contacts/lists/' + id);
export default API;