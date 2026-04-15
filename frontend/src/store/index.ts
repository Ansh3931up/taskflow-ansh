import { configureStore } from '@reduxjs/toolkit';

import { configureApiAuth } from '@/lib/api';
import authReducer, { logout } from '@/store/slices/authSlice';
import projectReducer from '@/store/slices/projectSlice';
import taskReducer from '@/store/slices/taskSlice';
import userReducer from '@/store/slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tasks: taskReducer,
    users: userReducer,
  },
});

configureApiAuth({
  getToken: () => store.getState().auth.token ?? localStorage.getItem('token'),
  onUnauthorized: () => {
    store.dispatch(logout());
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  },
  shouldReloadOn403ProjectDetail: () => /^\/projects\/[^/]+$/.test(window.location.pathname),
  onForbiddenProjectDetail: () => {
    window.location.assign('/projects');
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
