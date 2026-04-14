import apiClient from '@/lib/api';
import type { Task } from '@/types';

export const tasksApi = {
  list: (
    projectId: string,
    status?: string,
    assignee?: string,
    page = 1,
    limit = 10,
  ): Promise<{ tasks: Task[]; page: number; limit: number }> => {
    return apiClient.get(`/projects/${projectId}/tasks`, {
      params: { status, assignee, page, limit },
    });
  },

  create: (projectId: string, data: Partial<Task>): Promise<Task> =>
    apiClient.post(`/projects/${projectId}/tasks`, data),

  update: (id: string, data: Partial<Task>): Promise<Task> => apiClient.patch(`/tasks/${id}`, data),

  delete: (id: string): Promise<void> => apiClient.delete(`/tasks/${id}`),
};
