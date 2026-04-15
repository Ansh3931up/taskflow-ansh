import { configureStore } from '@reduxjs/toolkit';

import authReducer from '@/store/slices/authSlice';
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
