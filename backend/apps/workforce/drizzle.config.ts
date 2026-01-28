import { defineConfig } from 'drizzle-kit';

const connectionString = `${process.env.DATABASE_BASEURL}/dexaattendance_workforce`;

export default defineConfig({
  schema: [
    './apps/workforce/src/database/schema',
    './libs/common/src/index.ts'
  ],
  out: './apps/workforce/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString!,
  },
});
