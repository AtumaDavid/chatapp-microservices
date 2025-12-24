import express, { type Application } from 'express';

export const createApp = (): Application => {
  const app = express();

  app.get('/health', (_req, res) => {
    res.status(200).send('Auth Service is healthy');
  });

  return app;
};
