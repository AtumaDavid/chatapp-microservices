import { createEnv, z } from '@chatapp/common';
import 'dotenv/config';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),
  USER_SERVICE_PORT: z.coerce.number().int().min(0).max(65_535).default(4001),
  USER_DB_URL: z.string().min(1),
  USER_DB_SSL: z.coerce.boolean().default(false),
  RABBITMQ_URL: z.string().url().optional(),
  INTERNAL_AUTH_TOKEN: z.string().min(1),
});

type EnvType = z.infer<typeof envSchema>;

export const env: EnvType = createEnv(envSchema, {
  serviceName: 'user-service',
});

export type Env = typeof env;
