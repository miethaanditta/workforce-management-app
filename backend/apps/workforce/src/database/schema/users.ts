import { userRoleEnum } from '@app/common';
import { auditColumns } from '@app/common/constants/audit.constants';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  ...auditColumns,

  name: varchar('name', { length: 255 }).notNull(),

  email: varchar('email', { length: 255 }).notNull().unique(),

  role: userRoleEnum('role').default('USER').notNull()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;