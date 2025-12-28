import type { RequestHandler, NextFunction, Request, Response } from 'express';

export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

const toError = (err: unknown): Error => {
  if (err instanceof Error) {
    return err;
  }
  return new Error(String(err));
};

const forwardError = (err: unknown, _req: Request, _res: Response, next: NextFunction): void => {
  next(toError(err));
};

export const asyncHandler = (handler: AsyncHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch((err) => forwardError(err, req, res, next));
  };
};
