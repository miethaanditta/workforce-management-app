import { auditColumns } from '@app/common/constants/audit.constants';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const positions = pgTable('positions', {
  ...auditColumns,

  name: varchar('name', { length: 255 }).notNull()
});

export type Position = typeof positions.$inferSelect;
export type NewPosition = typeof positions.$inferInsert;