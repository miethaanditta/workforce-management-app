import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { auditColumns, bytea } from '@app/common';

export const files = pgTable('files', {
  ...auditColumns,
  
  filename: varchar('filename', { length: 255 }).notNull(),

  content: bytea('content').notNull(), // Stores the Buffer
});

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
