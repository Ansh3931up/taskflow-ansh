import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'is required'),
  email: z.string().email('invalid format'),
  password: z.string().min(6, 'must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('invalid format'),
  password: z.string().min(1, 'is required'),
});

// Natively infer strict TS types structurally from the schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
