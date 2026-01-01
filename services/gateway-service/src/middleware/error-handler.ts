import { HttpError } from '@chatapp/common';

import type { ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error({ err }, 'An error occurred');

  const error = err instanceof HttpError ? err : undefined;
  const statusCode = error?.statusCode ?? 500;
  const message =
    statusCode >= 500
      ? 'Internal Server Error'
      : (error?.message ?? 'An error occurred');
  const payload = error?.details
    ? { message, details: error.details }
    : { message };

  res.status(statusCode).json(payload);

  void _next();
};
