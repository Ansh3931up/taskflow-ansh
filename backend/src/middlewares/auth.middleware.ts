import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { config } from '../config';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'unauthorized');
    }

    const token = authHeader.split(' ')[1];

    // We strictly use config.JWT_SECRET (guaranteed to exist by Fail-Fast setup)
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Inject decoded JWT claims cleanly into the Request
    req.user = decoded as { id: string; email: string };
    next();
  } catch (error) {
    // Both missing headers and expired/tampered JWTs immediately return exact unauth body
    next(new ApiError(401, 'unauthorized'));
  }
};

// Alias for cleaner route registration semantics
export const authenticate = requireAuth;
