import type { Request } from 'express';
import { z } from 'zod';
import { TASK_STATUSES, TASK_PRIORITIES } from '../constants';

function firstQueryString(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (Array.isArray(v)) {
    const x = v[0];
    return typeof x === 'string' ? x : undefined;
  }
  return typeof v === 'string' ? v : undefined;
}

/** Validates `GET /projects/:id/tasks` query: enum status, assignee uuid or `unassigned`, positive paging. */
export const listTasksQuerySchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  assignee: z.union([z.literal('unassigned'), z.string().uuid()]).optional(),
  page: z.coerce.number().int().positive().max(10_000).default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export function parseListTasksQuery(query: Request['query']) {
  const status = firstQueryString(query.status);
  const assignee = firstQueryString(query.assignee);
  const page = firstQueryString(query.page);
  const limit = firstQueryString(query.limit);

  return listTasksQuerySchema.safeParse({
    status: status === '' ? undefined : status,
    assignee: assignee === '' ? undefined : assignee,
    page: page === '' || page === undefined ? undefined : page,
    limit: limit === '' || limit === undefined ? undefined : limit,
  });
}

/** Empty string from HTML forms → null (clear assignee). Omitted field stays undefined. */
const optionalAssigneeId = z.preprocess(
  (v) => (v === '' ? null : v),
  z.union([z.string().uuid(), z.null()]).optional(),
);

const optionalDueDate = z.preprocess(
  (v) => (v === '' ? undefined : v),
  z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), { message: 'invalid date' })
    .optional(),
);

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
