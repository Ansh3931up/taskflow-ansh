import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Strictly mapped directly to the Mock API appendix paths
router.use('/auth', authRoutes);

export default router;
