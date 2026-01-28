import { auditColumns } from '@app/common';
import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { staffs } from './staffs';

export const attendances = pgTable('attendances', {
  ...auditColumns,

  staffId: uuid('staff_id')
    .references(() => staffs.id)
    .notNull(),

  attendanceDate: timestamp('attendance_date', { withTimezone: true })
    .defaultNow()
    .notNull(),

  clockIn: timestamp('clock_in', { withTimezone: true }),

  clockOut: timestamp('clock_out', { withTimezone: true })
});

export type Attendance = typeof attendances.$inferSelect;
export type NewAttendance = typeof attendances.$inferInsert;
