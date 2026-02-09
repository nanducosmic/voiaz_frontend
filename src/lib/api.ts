import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Automatically add the token to EVERY request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add X-Tenant-ID header for multi-tenancy support
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.tenant_id) {
    config.headers['X-Tenant-ID'] = user.tenant_id;
  }

  return config;
});

export default api;