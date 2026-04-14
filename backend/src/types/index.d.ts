// Define global interfaces here
// Typical production implementations use this to extend Express interfaces

import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      // For example, when you build JWT authentication, you will inject the user object here:
      // user?: { id: string; role: string };
    }
  }
}
