import { Router } from 'express';
import { updateTask, deleteTask } from '../controllers';
import { requireAuth, validateRequest } from '../middlewares';
import { updateTaskSchema } from '../validations';

const router = Router();

// Securely lock underlying modification routes behind specific JWT authorization
router.use(requireAuth);

// Perfectly mapping Appendix Mock API specific Base Url targets
router.patch('/:id', validateRequest(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;
