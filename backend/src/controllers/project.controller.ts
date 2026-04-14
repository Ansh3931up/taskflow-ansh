import { Request, Response } from 'express';
import {
  listProjects as svcListProjects,
  createProject as svcCreateProject,
  getProject as svcGetProject,
  updateProject as svcUpdateProject,
  deleteProject as svcDeleteProject,
} from '../services';
import { asyncHandler } from '../utils/asyncHandler';

const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const data = await svcListProjects(req.user!.id);
  res.status(200).json(data);
});

const createProject = asyncHandler(async (req: Request, res: Response) => {
  const data = await svcCreateProject(req.user!.id, req.body);
  res.status(201).json(data);
});

const getProject = asyncHandler(async (req: Request, res: Response) => {
  const data = await svcGetProject(req.params.id as string);
  res.status(200).json(data);
});

const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const data = await svcUpdateProject(req.params.id as string, req.user!.id, req.body);
  res.status(200).json(data); // 200 mapping explicitly defined by Mock API
});

const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await svcDeleteProject(req.params.id as string, req.user!.id);
  res.status(204).send(); // Strictly mandated 204 No Content return
});

export { listProjects, createProject, getProject, updateProject, deleteProject };
