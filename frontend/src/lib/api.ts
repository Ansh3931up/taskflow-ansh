import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/** Injected after the Redux store is created to avoid api ↔ store circular imports. */
export type ApiAuthConfig = {
  getToken: () => string | null;
  onUnauthorized: () => void;
  shouldReloadOn403ProjectDetail: () => boolean;
  onForbiddenProjectDetail: () => void;
};

let apiAuth: ApiAuthConfig = {
  getToken: () => localStorage.getItem('token'),
  onUnauthorized: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  },
  shouldReloadOn403ProjectDetail: () => /^\/projects\/[^/]+$/.test(window.location.pathname),
  onForbiddenProjectDetail: () => {
    window.location.assign('/projects');
  },
};

/** Call once from `store/index.ts` after `configureStore` so interceptors use Redux + dispatch(logout). */
export function configureApiAuth(next: Partial<ApiAuthConfig>): void {
  apiAuth = { ...apiAuth, ...next };
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = apiAuth.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      apiAuth.onUnauthorized();
      return Promise.reject(error.response?.data || error);
    }

    if (status === 403 && apiAuth.shouldReloadOn403ProjectDetail()) {
      apiAuth.onForbiddenProjectDetail();
      return Promise.reject(error.response?.data || error);
    }

    return Promise.reject(error.response?.data || error);
  },
);

export default apiClient;
