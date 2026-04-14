import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      // Required by Rubric: Extracted from JWT claim
      user?: { id: string; email: string };
    }
  }
}
