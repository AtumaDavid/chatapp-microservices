import { Sequelize } from 'sequelize';
import { env } from '../config/env.js';
import { logger } from '@/utils/logger.js';

export const sequelize = new Sequelize(env.USER_DB_URL, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  define: {
    underscored: true,
    freezeTableName: true,
  },
});

export const connectToUserDB = async (): Promise<void> => {
  await sequelize.authenticate();
  logger.info('Connected to User Service Database successfully.');
};

export const initializeDatabase = async (): Promise<void> => {
  connectToUserDB();
};

export const closeUserDBConnection = async (): Promise<void> => {
  await sequelize.close();
  logger.info('User Service Database connection closed.');
};
