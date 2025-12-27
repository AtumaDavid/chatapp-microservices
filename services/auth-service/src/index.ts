import { createApp } from './app';
import { createServer } from 'http';
import { env } from './config/env';
import { logger } from './utils/logger';
import { closeAuthDBConnection, connectToAuthDB } from './DB/sequelize';
import { initModels } from './models';

const main = async () => {
  try {
    await connectToAuthDB();
    await initModels();
    const app = createApp();
    const server = createServer(app);

    const port = env.AUTH_SERVICE_PORT;

    server.listen(port, () => {
      logger.info(`Auth Service is running on port ${port}`);
    });

    // Gracefully shuts down the Auth Service when a termination signal is received.
    // Logs the shutdown process, closes the HTTP server, and exits the process cleanly.
    // This structure allows you to add async cleanup tasks (e.g., closing DB connections) in the future.
    const shutdown = () => {
      logger.info('Shutting down Auth Service...');

      Promise.all([closeAuthDBConnection()])
        .catch((err: unknown) => {
          logger.error(
            `Error during shutdown: ${err instanceof Error ? err.message : String(err)}`,
          );
        })
        .finally(() => {
          server.close(() => {
            logger.info('Auth Service has been shut down.');
            process.exit(0);
          });
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error(
      `Failed to start Auth Service: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
};

main();
