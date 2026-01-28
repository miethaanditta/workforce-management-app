import { auditColumns } from '@app/common/constants/audit.constants';
import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const inboxes = pgTable('inboxes', {
  ...auditColumns,

  recipientId: uuid('recipient_id').notNull(),

  senderId: uuid('sender_id').notNull(),

  title: varchar('title', { length: 255 }).notNull(),

  content: varchar('content', { length: 255 }).notNull()
});

export type Inbox = typeof inboxes.$inferSelect;
export type NewInbox = typeof inboxes.$inferInsert;