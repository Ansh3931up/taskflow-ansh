import { Router } from 'express';
import { listUsers } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Protected: only logged in users can see other users
router.get('/', authenticate, listUsers);

export default router;
