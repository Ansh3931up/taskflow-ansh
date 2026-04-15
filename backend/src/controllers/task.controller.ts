import { Request, Response } from 'express';
import {
  listTasks as svcListTasks,
  createTask as svcCreateTask,
  updateTask as svcUpdateTask,
  deleteTask as svcDeleteTask,
} from '../services';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const { status, assignee } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const data = await svcListTasks(req.params.id as string, req.user!.id, {
    status: status as string,
    assignee: assignee as string,
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
