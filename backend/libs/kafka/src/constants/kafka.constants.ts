import { timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const KAFKA_BROKER = process.env.KAFKA_BROKER ?? 'localhost:9092';
export const KAFKA_CLIENT_ID = 'dexaattendanceapp-client';
export const KAFKA_CONSUMER_GROUP = 'dexaattendanceapp-consumer';

// Kafka Topics
export const KAFKA_TOPICS = {
    // Auth Events
    USER_REGISTERED: 'user.registered',
    USER_DELETED: 'user.deleted',

    // Notification Triggers
    SEND_PUSH: 'notification.push'
} as const;

export type KafkaTopics = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];

export const kafkaColumns = {
    messageId: uuid('message_id').defaultRandom().notNull(),
    topic: varchar('topic', { length: 255 }).notNull(),
    message: varchar('message').notNull(),
};
