import { Router } from 'express';
import { registerUser, loginUser } from '../controllers';
import { validateRequest } from '../middlewares';
import { registerSchema, loginSchema } from '../validations';

const router = Router();

// Since the controller natively wraps itself in asyncHandler, we physically route straight to it!
router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);

export default router;
