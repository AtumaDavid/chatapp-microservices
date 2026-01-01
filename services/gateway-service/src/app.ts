import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './middleware/error-handler';
import { registerRoutes } from './routes';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      credentials: true,
      // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      // allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  registerRoutes(app);

  app.use((_req, res) => {
    res.status(404).send('Not Found');
  });

  // app.get('/health', (_req, res) => {
  //   res.status(200).send('Auth Service is healthy');
  // });

  app.use(errorHandler);

  return app;
};
