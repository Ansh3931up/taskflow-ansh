import apiClient from '@/lib/api';
import type { AuthResponse } from '@/types';

export const authApi = {
  login: (data: any): Promise<AuthResponse> =>
    apiClient.post<any, AuthResponse>('/auth/login', data),

  register: (data: any): Promise<AuthResponse> =>
    apiClient.post<any, AuthResponse>('/auth/register', data),
};
