import { auditColumns } from '@app/common';
import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';
import { files } from './files';
import { positions } from './positions';

export const staffs = pgTable('staffs', {
  ...auditColumns,

  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),

  positionId: uuid('position_id')
    .references(() => positions.id)
    .notNull(),

  name: varchar('name', { length: 255 }).notNull(),

  phoneNo: varchar('phone_no', { length: 20 }),

  fileId: uuid('file_id')
    .references(() => files.id)
});

export type Staff = typeof staffs.$inferSelect;
export type NewStaff = typeof staffs.$inferInsert;
