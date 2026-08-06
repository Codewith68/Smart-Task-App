import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = null;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/signup') &&
      !url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const res = await api.post('/auth/refresh');
        setAccessToken(res.data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401 && url.includes('/auth/refresh')) {
      clearAccessToken();
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
