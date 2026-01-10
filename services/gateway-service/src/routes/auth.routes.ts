import {
  loginUser,
  refreshTokens,
  registerUser,
  revokeUserTokens,
} from '@/controllers/auth.controller';
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  revokeSchema,
} from '@/validation/auth.schema';
import { asyncHandler, validateRequest } from '@chatapp/common';
import { Router } from 'express';

export const authRouter: Router = Router();

authRouter.post('/register', validateRequest({ body: registerSchema }), asyncHandler(registerUser));

authRouter.post('/login', validateRequest({ body: loginSchema }), asyncHandler(loginUser));

authRouter.post(
  '/refresh-token',
  validateRequest({ body: refreshTokenSchema }),
  asyncHandler(refreshTokens),
);

authRouter.post('/logout', validateRequest({ body: revokeSchema }), asyncHandler(revokeUserTokens));
