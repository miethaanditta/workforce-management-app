import { auditColumns } from '@app/common/constants/audit.constants';
import { kafkaColumns } from '@app/kafka';
import { pgTable } from 'drizzle-orm/pg-core';

export const kafkaReceived = pgTable('kafka.received', {
  ...auditColumns,
  ...kafkaColumns
});

export type KafkaReceived = typeof kafkaReceived.$inferSelect;
export type NewKafkaReceived = typeof kafkaReceived.$inferInsert;