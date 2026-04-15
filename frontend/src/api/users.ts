import api from '@/lib/api';
import { unwrapApiData } from '@/lib/api-helpers';
import type { User } from '@/types';

export const usersApi = {
  list: async (): Promise<User[]> => {
    const raw = await api.get<unknown>('/users');
    return unwrapApiData<User[]>(raw);
  },
};
