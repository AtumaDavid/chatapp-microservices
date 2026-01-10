import {
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  registerHandler,
} from '@/controllers/auth.controller';
import { validateRequest } from '@chatapp/common';

import { Router } from 'express';
import { loginSchema, refreshTokenSchema, registerSchema, revokeSchema } from './auth.schema';

export const authRouter: Router = Router();

authRouter.post('/register', validateRequest({ body: registerSchema.shape.body }), registerHandler);
authRouter.post('/login', validateRequest({ body: loginSchema.shape.body }), loginHandler);
authRouter.post(
  '/refresh-token',
  validateRequest({ body: refreshTokenSchema.shape.body }),
  refreshTokenHandler,
);
authRouter.post('/logout', validateRequest({ body: revokeSchema.shape.body }), logoutHandler);
