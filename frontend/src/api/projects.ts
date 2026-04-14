import apiClient from '@/lib/api';
import type { Project } from '@/types';

export const projectsApi = {
  list: (page = 1, limit = 10): Promise<{ projects: Project[]; page: number; limit: number }> =>
    apiClient.get(`/projects`, {
      params: { page, limit },
    }),

  getById: (id: string): Promise<Project> => apiClient.get(`/projects/${id}`),

  create: (data: Partial<Project>): Promise<Project> => apiClient.post('/projects', data),

  update: (id: string, data: Partial<Project>): Promise<Project> =>
    apiClient.patch(`/projects/${id}`, data),

  delete: (id: string): Promise<void> => apiClient.delete(`/projects/${id}`),

  getStats: (id: string): Promise<any> => apiClient.get(`/projects/${id}/stats`),
};
