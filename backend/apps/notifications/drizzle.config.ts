import { defineConfig } from 'drizzle-kit';

const connectionString = `${process.env.DATABASE_BASEURL}/dexaattendance_notifications`;

export default defineConfig({
  schema: [
    './apps/notifications/src/database/schema',
    './libs/common/src/index.ts'
  ],
  out: './apps/notifications/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString!,
  },
});
