import axios from 'axios';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Explicit Authentication Binding Matrix natively securing REST tokens seamlessly
apiClient.interceptors.request.use(
  (config) => {
    // Dynamically retrieve latest strictly typed token via Redux state bounds natively
    const token = store.getState().auth.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 401 = invalid/missing auth → logout. 403 = forbidden resource → do NOT logout (e.g. lost project access after reassigning yourself off the last task).
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const path = window.location.pathname;

    if (status === 401) {
      store.dispatch(logout());
      if (path !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error.response?.data || error);
    }

    if (status === 403) {
      // Lost access to this project (e.g. no longer owner/assignee/creator) — go to list with a full reload so projects refetch.
      if (/^\/projects\/[^/]+$/.test(path)) {
        window.location.assign('/projects');
        return Promise.reject(error.response?.data || error);
      }
    }

    return Promise.reject(error.response?.data || error);
  },
);

export default apiClient;
