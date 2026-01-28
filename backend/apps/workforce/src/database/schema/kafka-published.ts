import { auditColumns } from '@app/common/constants/audit.constants';
import { kafkaColumns } from '@app/kafka';
import { pgTable } from 'drizzle-orm/pg-core';

export const kafkaPublished = pgTable('kafka.published', {
  ...auditColumns,
  ...kafkaColumns
});

export type KafkaPublished = typeof kafkaPublished.$inferSelect;
export type NewKafkaPublished = typeof kafkaPublished.$inferInsert;