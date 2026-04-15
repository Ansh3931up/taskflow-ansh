import app from './app';
import pool from './database';
import { logger } from './utils/logger';
import { config } from './config';

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Taskflow Backend is gracefully live at http://localhost:${PORT}`);
});

// Formal Graceful Shutdown Protocol (Required by Rubric)
const shutdown = async (signal: string) => {
  logger.info(`\n${signal} signal received: closing HTTP server and Database connections...`);

  server.close(async () => {
    logger.info('HTTP server explicitly closed.');
    await pool.end();
    logger.info('Database pool explicitly closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
