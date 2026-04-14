import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignee_id: z.string().uuid().optional().nullable(),
  due_date: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignee_id: z.string().uuid().optional().nullable(),
  due_date: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
