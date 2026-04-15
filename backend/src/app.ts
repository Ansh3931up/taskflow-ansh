import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import apiRoutes from './routes';
import { errorHandler } from './utils';
import { logger } from './utils/logger';

dotenv.config();

const app: Application = express();

// Security and Optimization Middlewares
app.use(helmet()); // Sets robust HTTP security headers
app.use(cors()); // Enables cross-origin requests
app.use(compression()); // GZIP payload compression for speed

// Pipe all HTTP request logs through pino for a unified log stream
const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
app.use(
  morgan(':method :url :status :response-time ms - :res[content-length]', { stream: morganStream }),
);

// Body Parsing Middlewares (Modern replacement for body-parser)
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Core API Routing (Strictly respects the appendix Base URL: http://localhost:4000)
app.use('/', apiRoutes);

// Global error handling middleware (must theoretically sit below all routes)
app.use(errorHandler);

export default app;
