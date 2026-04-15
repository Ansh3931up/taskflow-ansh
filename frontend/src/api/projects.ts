import apiClient from '@/lib/api';
import type { Project } from '@/types';

export const projectsApi = {
  list: async (
    page = 1,
    limit = 10,
  ): Promise<{ projects: Project[]; page: number; limit: number; total: number }> => {
    const response: any = await apiClient.get(`/projects`, { params: { page, limit } });
    return response.data as { projects: Project[]; page: number; limit: number; total: number };
  },

  getById: async (id: string): Promise<Project> => {
    const response: any = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  create: async (data: Partial<Project>): Promise<Project> => {
    const response: any = await apiClient.post('/projects', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response: any = await apiClient.patch(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  getStats: async (id: string): Promise<any> => {
    const response: any = await apiClient.get(`/projects/${id}/stats`);
    return response.data;
  },
};
