import { env } from '@/config/env';
import { userService } from '@/services/user.service';
import { logger } from '@/utils/logger';
import {
  AUTH_EVENT_EXCHANGE,
  AUTH_USER_REGISTERED_ROUTING_KEY,
  type AuthRegisteredEvent,
} from '@chatapp/common';

import {
  connect,
  type Channel,
  type ChannelModel,
  type Connection,
  type ConsumeMessage,
  type Replies,
} from 'amqplib';

type ManageConnection = Connection & ChannelModel;

let connectionRef: ManageConnection | null = null;
let channel: Channel | null = null;
let consumerTag: string | null = null;

const QUEUE_NAME = 'user-service.auth-events';

const closeConnection = async (conn: ManageConnection) => {
  await conn.close();
  connectionRef = null;
  channel = null;
  consumerTag = null;
};

const handleMessage = async (msg: ConsumeMessage, ch: Channel) => {
  const raw = msg.content.toString('utf-8');
  const event = JSON.parse(raw) as AuthRegisteredEvent;

  await userService.syncFromAuthUser(event.payload);

  ch.ack(msg);
};

export const startAuthEventConsumer = async () => {
  if (!env.RABBITMQ_URL) {
    logger.warn('RABBITMQ_URL is not defined. Skipping Auth Event Consumer startup.');
    return;
  }

  if (channel) {
    return;
  }

  const connection = (await connect(env.RABBITMQ_URL)) as ManageConnection;
  connectionRef = connection;
  channel = await connection.createChannel();

  await channel.assertExchange(AUTH_EVENT_EXCHANGE, 'topic', { durable: true });
  const q = await channel.assertQueue(QUEUE_NAME, { durable: true });

  await channel.bindQueue(q.queue, AUTH_EVENT_EXCHANGE, AUTH_USER_REGISTERED_ROUTING_KEY);

  const consumeReply: Replies.Consume = await channel.consume(
    q.queue,
    async (msg) => {
      if (msg) {
        try {
          await handleMessage(msg, channel as Channel);
        } catch (error) {
          logger.error(
            `Error processing Auth Event message: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          channel!.nack(msg, false, false); // Discard the message on error
        }
      }
    },
    { noAck: false },
  );

  consumerTag = consumeReply.consumerTag;

  connection.on('close', () => {
    connectionRef = null;
    channel = null;
    consumerTag = null;
    logger.info('Auth Event Consumer connection closed.');
  });

  connection.on('error', (err) => {
    logger.error(`Auth Event Consumer connection error: ${err.message}`);
  });

  logger.info('Auth Event Consumer started.');
};

export const stopAuthEventConsumer = async () => {
  try {
    if (connectionRef && channel && consumerTag) {
      await channel.cancel(consumerTag);
      await closeConnection(connectionRef);
      logger.info('Auth Event Consumer stopped.');
    }
  } catch (error) {
    logger.error(
      `Error stopping Auth Event Consumer: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};
