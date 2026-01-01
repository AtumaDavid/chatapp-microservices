import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import {
  AUTH_EVENT_EXCHANGE,
  AUTH_USER_REGISTERED_ROUTING_KEY,
  type AuthUserRegisteredPayload,
} from '@chatapp/common';
import { connect, type Channel, type ChannelModel } from 'amqplib';
import { version } from 'node:os';

let connectionRef: ChannelModel | null = null;
let channel: Channel | null = null;

export const initPublisher = async () => {
  if (!env.RABBITMQ_URL) {
    throw new Error('RABBITMQ_URL is not defined in environment variables');
    return;
  }

  if (channel) {
    return;
  }

  const connection = await connect(env.RABBITMQ_URL);
  connectionRef = connection;

  channel = await connection.createChannel();
  await channel.assertExchange(AUTH_EVENT_EXCHANGE, 'topic', { durable: true });

  connection.on('close', () => {
    logger.warn('RabbitMQ connection closed');
    connectionRef = null;
    channel = null;
  });

  connection.on('error', (err) => {
    logger.error('RabbitMQ connection error', err);
  });

  logger.info('RabbitMQ publisher initialized');
};

export const publishAuthUserRegisteredEvent = async (payload: AuthUserRegisteredPayload) => {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized. Cannot publish message.');
  }

  const event = {
    type: AUTH_USER_REGISTERED_ROUTING_KEY,
    payload,
    occurredAt: new Date().toISOString(),
    metadata: { version: 1 },
  };

  const published = channel.publish(
    AUTH_EVENT_EXCHANGE,
    AUTH_USER_REGISTERED_ROUTING_KEY,
    Buffer.from(JSON.stringify(event)),
    { contentType: 'application/json', persistent: true },
  );

  if (!published) {
    logger.warn({ event }, 'failed to publish user registered event');
  }
};

export const closePublisher = async () => {
  try {
    const ch = channel;
    if (ch) {
      await ch.close();
      channel = null;
    }

    const conn = connectionRef;
    if (conn) {
      await conn.close();
      connectionRef = null;
    }
  } catch (error) {
    logger.error({ error }, 'Error closing RabbitMQ connection or channel');
  }
};
