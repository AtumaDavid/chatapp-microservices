import pino from 'pino';
import type { Logger, LoggerOptions } from 'pino';

type CreateLoggerOptions = LoggerOptions & {
  name?: string;
};

export const createLogger = (options: CreateLoggerOptions = {}): Logger => {
  const { name, ...pinoOptions } = options;

  const transport =
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            // ignore: 'pid,hostname',
          },
        }
      : undefined;

  const logger = pino({
    name,
    transport,
    ...pinoOptions,
  });

  return logger;
};
