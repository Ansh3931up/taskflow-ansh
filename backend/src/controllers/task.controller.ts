import { Request, Response } from 'express';
import {
  listTasks as svcListTasks,
  createTask as svcCreateTask,
  updateTask as svcUpdateTask,
  deleteTask as svcDeleteTask,
} from '../services';
import { asyncHandler } from '../utils/asyncHandler';

const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const { status, assignee } = req.query;
  const data = await svcListTasks(req.params.id as string, {
    status: status as string,
    assignee: assignee as string,
  });
  res.status(200).json(data);
});

const createTask = asyncHandler(async (req: Request, res: Response) => {
  const data = await svcCreateTask(req.params.id as string, req.user!.id, req.body);
  res.status(201).json(data);
});

const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const data = await svcUpdateTask(req.params.id as string, req.body);
  res.status(200).json(data);
});

const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await svcDeleteTask(req.params.id as string, req.user!.id);
  res.status(204).send();
});

export { listTasks, createTask, updateTask, deleteTask };
