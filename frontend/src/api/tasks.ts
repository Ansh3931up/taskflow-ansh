import apiClient from '@/lib/api';
import { unwrapApiData } from '@/lib/api-helpers';
import type { Task, TaskPriority, TaskStatus } from '@/types';

/** API expects snake_case keys per OpenAPI / assignment spec */
export type TaskWritePayload = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string | null;
  due_date?: string | null;
};

export const tasksApi = {
  list: async (
    projectId: string,
    status?: string,
    assignee?: string,
    page = 1,
    limit = 100,
  ): Promise<{ tasks: Task[]; page: number; limit: number; total: number }> => {
    const response = await apiClient.get(`/projects/${projectId}/tasks`, {
      params: { status, assignee, page, limit },
    });
    return unwrapApiData<{ tasks: Task[]; page: number; limit: number; total: number }>(response);
  },

  create: async (projectId: string, data: TaskWritePayload): Promise<Task> => {
    const response = await apiClient.post(`/projects/${projectId}/tasks`, data);
    return unwrapApiData<Task>(response);
  },

  update: async (id: string, data: TaskWritePayload): Promise<Task> => {
    const response = await apiClient.patch(`/tasks/${id}`, data);
    return unwrapApiData<Task>(response);
  },

  delete: (id: string): Promise<void> => apiClient.delete(`/tasks/${id}`),
};
