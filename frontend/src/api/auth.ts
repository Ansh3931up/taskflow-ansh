import apiClient from '@/lib/api';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types';

export const authApi = {
  login: async (data: LoginCredentials): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/login', data);
    return res as unknown as AuthResponse;
  },

  register: async (data: RegisterCredentials): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/register', data);
    return res as unknown as AuthResponse;
  },
};
