import { Router } from 'express';
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  listTasks,
  createTask,
} from '../controllers';
import { requireAuth, validateRequest } from '../middlewares';
import { createProjectSchema, updateProjectSchema, createTaskSchema } from '../validations';

const router = Router();

router.use(requireAuth);

router.get('/', listProjects);
router.post('/', validateRequest(createProjectSchema), createProject);
router.get('/:id', getProject);
router.patch('/:id', validateRequest(updateProjectSchema), updateProject);
router.delete('/:id', deleteProject);

// Nested routing mapping for task filtering internally within specific projects
router.get('/:id/tasks', listTasks);
router.post('/:id/tasks', validateRequest(createTaskSchema), createTask);

export default router;
