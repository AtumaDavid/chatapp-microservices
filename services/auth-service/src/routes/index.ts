import { Router } from 'express';
import { authRouter } from './auth.routes';

export const registerRoute = (app: Router) => {
  app.use('/auth', authRouter);
};
