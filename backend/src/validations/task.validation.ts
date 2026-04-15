import { z } from 'zod';
import { TASK_STATUSES, TASK_PRIORITIES } from '../constants';

/** Empty string from HTML forms → null (clear assignee). Omitted field stays undefined. */
const optionalAssigneeId = z.preprocess(
  (v) => (v === '' ? null : v),
  z.union([z.string().uuid(), z.null()]).optional(),
);

const optionalDueDate = z.preprocess((v) => (v === '' ? undefined : v), z.string().optional());

export const createTaskSchema = z.object({
  title: z.string().min(1, 'is required'),
  description: z.string().optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assignee_id: optionalAssigneeId,
  due_date: optionalDueDate,
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assignee_id: optionalAssigneeId,
  due_date: optionalDueDate,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
