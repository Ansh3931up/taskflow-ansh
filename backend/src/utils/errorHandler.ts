import { Request, Response, NextFunction } from 'express';
import { ApiError } from './ApiError';
import { logger } from './logger';

/**
 * Global Error Handler Middleware
 * Formats all application errors into a standardized JSON response.
 * Logs every error through pino for structured server-side visibility.
 */
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;

  // If the error isn't explicitly an ApiError instance, wrap it in one
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'internal server error';
    error = new ApiError(statusCode, message, error.fields, err.stack);
  }

  // Log every error through pino for server-side visibility
  // 4xx = warn (client errors), 5xx = error (server errors)
  const logPayload = {
    statusCode: error.statusCode,
    method: req.method,
    url: req.originalUrl,
    message: error.message,
    fields: error.fields,
    stack: error.stack,
  };

  if (error.statusCode >= 500) {
    logger.error(
      logPayload,
      `${req.method} ${req.originalUrl} → ${error.statusCode} ${error.message}`,
    );
  } else {
    logger.warn(
      logPayload,
      `${req.method} ${req.originalUrl} → ${error.statusCode} ${error.message}`,
    );
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
