import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async Express routes to automatically catch errors and pass them to the global Error Handler.
 * Eliminates the need to write massive try/catch blocks inside every single controller.
 */
const asyncHandler = (
  requestHandler: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
