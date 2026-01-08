import { createApp } from './app';
import { createServer } from 'http';
import { env } from './config/env';
import { logger } from './utils/logger';
import { initializeDatabase } from './db/sequelize';
import { startAuthEventConsumer } from './messaging/auth-consumer';

const main = async () => {
  try {
    await initializeDatabase();
    await startAuthEventConsumer();

    const app = createApp();
    const server = createServer(app);

    const port = env.USER_SERVICE_PORT;

    server.listen(port, () => {
      logger.info(`User Service is running on port ${port}`);
    });

    // Gracefully shuts down the User Service when a termination signal is received.
    // Logs the shutdown process, closes the HTTP server, and exits the process cleanly.
    // This structure allows you to add async cleanup tasks (e.g., closing DB connections) in the future.
    const shutdown = () => {
      logger.info('Shutting down User Service...');

      Promise.all([])
        .catch((err: unknown) => {
          logger.error(
            `Error during shutdown: ${err instanceof Error ? err.message : String(err)}`,
          );
        })
        .finally(() => {
          server.close(() => {
            logger.info('User Service has been shut down.');
            process.exit(0);
          });
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error(
      `Failed to start Gateway Service: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
};

main();
