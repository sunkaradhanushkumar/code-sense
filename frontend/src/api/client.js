import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45s for deep AI analysis
});

// Request interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('codesense_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract error messages nicely
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(customMessage));
  }
);

export default api;
