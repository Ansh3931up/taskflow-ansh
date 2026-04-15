import { Request, Response } from 'express';
import {
  listTasks as svcListTasks,
  createTask as svcCreateTask,
  updateTask as svcUpdateTask,
  deleteTask as svcDeleteTask,
} from '../services';
import { parseListTasksQuery } from '../validations/task.validation';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const parsed = parseListTasksQuery(req.query);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const key = issue.path[0];
      if (key !== undefined) fields[String(key)] = issue.message;
    });
    throw new ApiError(400, 'validation failed', fields);
  }

  const { status, assignee, page, limit } = parsed.data;
  const data = await svcListTasks(req.params.id as string, req.user!.id, {
    status,
    assignee,
    page,
    limit,
  });
  res.status(200).json(new ApiResponse(200, data));
});

const createTask = asyncHandler(async (req: Request, res: Response) => {
  const data = await svcCreateTask(req.params.id as string, req.user!.id, req.body);
  res.status(201).json(new ApiResponse(201, data));
});

const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const data = await svcUpdateTask(req.params.id as string, req.user!.id, req.body);
  res.status(200).json(new ApiResponse(200, data));
});

const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await svcDeleteTask(req.params.id as string, req.user!.id);
  res.status(204).send();
});

export { listTasks, createTask, updateTask, deleteTask };
