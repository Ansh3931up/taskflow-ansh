import { z } from 'zod';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

// Strict shape expected for the Application to safely boot
const defaultOrigins =
  'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().url('A valid PostgreSQL connection string is exclusively required'),
  JWT_SECRET: z.string().min(10, 'JWT Secret must be cryptographically complex'),
  /**
   * Comma-separated browser origins allowed to call this API (scheme + host + port, no path).
   * Must match the `Origin` header exactly. Required for credentialed / cross-origin requests.
   */
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default(defaultOrigins)
    .transform((raw) =>
      raw
        .split(',')
        .map((o) => o.trim())
        .filter((o) => o.length > 0),
    )
    .refine((origins) => origins.length > 0, {
      message: 'CORS_ALLOWED_ORIGINS must list at least one origin',
    }),
});

// Safely parse the raw process.env object against the strict Zod boundary
const _env = envSchema.safeParse(process.env);

// Implement the strict "Fail-Fast" Architecture Principle
// The server will instantly crash and refuse to boot if security keys are missing or invalid
if (!_env.success) {
  logger.error('❌ FATAL: Missing or Invalid strict Environment Variables!');
  console.error(_env.error.format());
  process.exit(1);
}

// Export a frozen, strictly typed configuration object (removes the need to constantly cast "as string")
export const config = Object.freeze(_env.data);
