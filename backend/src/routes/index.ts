import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import userRoutes from './user.routes';

const router = Router();

// Strictly mapped directly to the Mock API appendix paths
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);

export default router;
