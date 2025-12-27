import { z } from 'zod';
import { HttpError } from '../errors/http-error';
import type { NextFunction, Request, Response } from 'express';
import type { ZodError, ZodType, ZodObject } from 'zod';
import { issue } from 'zod/v4/core/util.cjs';

type Schema = ZodType<any, any, any> | ZodObject<any>;
type ParamsRecord = Record<string, unknown>;
type QueryRecord = Record<string, unknown>;

export interface RequestValidationSchemas {
  body?: Schema;
  params?: Schema;
  query?: Schema;
}
const formattedError = (error: ZodError) => {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
};

export const validateRequest = (schemas: RequestValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const parsedBody = schemas.body.parse(req.body) as unknown;
        req.body = parsedBody;
      }

      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params as ParamsRecord);
        req.params = parsedParams as Request['params'];
      }

      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query as QueryRecord);
        req.query = parsedQuery as Request['query'];
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = formattedError(error);
        return next(
          new HttpError(400, 'Request validation failed', {
            issues: formattedError(error),
          })
        );
      }
      return next(error);
    }
  };
};
