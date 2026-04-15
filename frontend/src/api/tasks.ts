import apiClient from '@/lib/api';
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

function unwrap<T>(response: { data: T } | T): T {
  if (response && typeof response === 'object' && 'data' in response && 'statusCode' in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

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
    return unwrap(response) as { tasks: Task[]; page: number; limit: number; total: number };
  },

  create: async (projectId: string, data: TaskWritePayload): Promise<Task> => {
    const response = await apiClient.post(`/projects/${projectId}/tasks`, data);
    return unwrap(response) as Task;
  },

  update: async (id: string, data: TaskWritePayload): Promise<Task> => {
    const response = await apiClient.patch(`/tasks/${id}`, data);
    return unwrap(response) as Task;
  },

  delete: (id: string): Promise<void> => apiClient.delete(`/tasks/${id}`),
};
