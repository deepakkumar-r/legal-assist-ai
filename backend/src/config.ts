import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8787),
  APP_ORIGIN: z.string().url().default('http://localhost:5173'),
  GEMINI_API_KEY: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().optional(),
  ),
  GEMINI_REASONING_MODEL: z.string().default('gemini-3.1-pro-preview'),
  GEMINI_FAST_MODEL: z.string().default('gemini-3.6-flash'),
  GEMINI_EMBEDDING_MODEL: z.string().default('gemini-embedding-2'),
  DATA_ENCRYPTION_KEY: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .string()
      .regex(/^[a-fA-F0-9]{64}$/)
      .optional(),
  ),
  AUTH_MODE: z.enum(['local', 'gateway']).default('local'),
  DEMO_MODE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
});
export type Config = z.infer<typeof EnvSchema>;
export const loadConfig = (env: NodeJS.ProcessEnv = process.env): Config => EnvSchema.parse(env);
