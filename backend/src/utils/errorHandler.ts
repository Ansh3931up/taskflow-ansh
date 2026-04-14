import { Request, Response, NextFunction } from 'express';
import { ApiError } from './ApiError';

/**
 * Global Error Handler Middleware
 * Formats all application errors into a standardized JSON response.
 */
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;

  // If the error isn't explicitly an ApiError instance, wrap it in one
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'internal server error';
    error = new ApiError(statusCode, message, error.fields, err.stack);
  }

  // Exact response structure mandated by the prompt
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response: any = {
    error: error.message,
  };

  if (error.fields) {
    response.fields = error.fields;
  }

  // Only send heavy stack traces in development mode for debugging
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  return res.status(error.statusCode).json(response);
};

export { errorHandler };
