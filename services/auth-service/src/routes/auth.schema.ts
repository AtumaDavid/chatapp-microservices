import { z } from '@chatapp/common';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    displayName: z.string().min(3).max(50),
    password: z.string().min(6),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const revokeSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
  }),
});
