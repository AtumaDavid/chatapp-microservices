import { Sequelize } from 'sequelize';
import { env } from '../config/env.js';
import { logger } from '@/utils/logger.js';

export const sequelize = new Sequelize(env.AUTH_DB_URL, {
  dialect: 'mysql',
  logging: env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  define: {
    underscored: true,
    freezeTableName: true,
  },
});

export const connectToAuthDB = async (): Promise<void> => {
  await sequelize.authenticate();
  logger.info('Connected to Auth Service Database successfully.');
};

export const closeAuthDBConnection = async (): Promise<void> => {
  await sequelize.close();
  logger.info('Auth Service Database connection closed.');
};
