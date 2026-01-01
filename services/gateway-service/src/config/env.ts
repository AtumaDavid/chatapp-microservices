import { createEnv, z } from '@chatapp/common';
import 'dotenv/config';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),
  GATEWAY_PORT: z.coerce.number().int().min(0).max(65_535).default(4000),
  AUTH_SERVICE_URL: z.string().url(),
  INTERNAL_API_KEY: z.string().min(1),
});

type EnvType = z.infer<typeof envSchema>;

export const env: EnvType = createEnv(envSchema, {
  serviceName: 'gateway-service',
});

export type Env = typeof env;
