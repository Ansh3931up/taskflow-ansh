import apiClient from '@/lib/api';
import { unwrapApiData } from '@/lib/api-helpers';
import type { Project, ProjectStats } from '@/types';

type ProjectsListPayload = {
  projects: Project[];
  page: number;
  limit: number;
  total: number;
};

export const projectsApi = {
  list: async (page = 1, limit = 10): Promise<ProjectsListPayload> => {
    const raw = await apiClient.get<unknown>(`/projects`, { params: { page, limit } });
    return unwrapApiData<ProjectsListPayload>(raw);
  },

  getById: async (id: string): Promise<Project> => {
    const raw = await apiClient.get<unknown>(`/projects/${id}`);
    return unwrapApiData<Project>(raw);
  },

  create: async (data: Partial<Pick<Project, 'name' | 'description'>>): Promise<Project> => {
    const raw = await apiClient.post<unknown>('/projects', data);
    return unwrapApiData<Project>(raw);
  },

  update: async (
    id: string,
    data: Partial<Pick<Project, 'name' | 'description'>>,
  ): Promise<Project> => {
    const raw = await apiClient.patch<unknown>(`/projects/${id}`, data);
    return unwrapApiData<Project>(raw);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  getStats: async (id: string): Promise<ProjectStats> => {
    const raw = await apiClient.get<unknown>(`/projects/${id}/stats`);
    return unwrapApiData<ProjectStats>(raw);
  },
};
