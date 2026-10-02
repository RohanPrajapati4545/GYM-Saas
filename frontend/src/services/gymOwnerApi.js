import axios from 'axios';

const gymOwnerApi = axios.create({
  baseURL: import.meta.env.VITE_GYM_OWNER_API_URL || 'http://localhost:5003',
  headers: {
    'Content-Type': 'application/json',
  },
});

gymOwnerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default gymOwnerApi;
