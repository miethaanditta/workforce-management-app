import { timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const auditColumns = {
    id: uuid('id').defaultRandom().primaryKey(),

    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),

    createdBy: varchar('created_by', { length: 50 }),

    modifiedAt: timestamp('modified_at', { withTimezone: true, mode: 'date' })
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),

    modifiedBy: varchar('modified_by', { length: 50 }),
};
