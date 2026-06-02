import axios from 'axios';
import toast from 'react-hot-toast';

const fallbackApiUrl = typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:5000';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || fallbackApiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nestdrive_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nestdrive_token');
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
