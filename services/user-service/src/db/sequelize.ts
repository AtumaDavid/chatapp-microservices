import { Sequelize } from 'sequelize';
import { env } from '../config/env.js';
import { logger } from '@/utils/logger.js';
import { initUserModel } from './models/user.model';

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
  await connectToUserDB();

  // Register models before syncing so Sequelize can create/update tables
  initUserModel(sequelize);

  const syncOptions = env.NODE_ENV === 'development' ? { alter: true } : {};
  await sequelize.sync(syncOptions);
  logger.info('User Service Database synchronized successfully.');
};

export const closeUserDBConnection = async (): Promise<void> => {
  await sequelize.close();
  logger.info('User Service Database connection closed.');
};
