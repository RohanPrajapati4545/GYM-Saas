import axios from 'axios';

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_SUPER_ADMIN_API_URL || 'http://localhost:5002',
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminApi.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default adminApi;
