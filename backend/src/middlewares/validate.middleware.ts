import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Validates Zod schemas and perfectly maps failures to the Assignment's expected 400 format.
 */
export const validateRequest = (schema: z.ZodSchema) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.body);
      (req as Request).body = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Map native Zod errors to the assignment's exact { fields: { email: "is required" } } shape
        const fields: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fields[err.path[0] as string] = err.message;
          }
        });
        next(new ApiError(400, 'validation failed', fields));
      } else {
        next(error);
      }
    }
  });
};
