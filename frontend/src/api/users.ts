import api from '@/lib/api';
import type { User } from '@/types';

export const usersApi = {
  list: async (): Promise<User[]> => {
    const response: any = await api.get('/users');
    return response.data;
  },
};
