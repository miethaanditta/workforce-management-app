import { defineConfig } from 'drizzle-kit';

const connectionString = `${process.env.DATABASE_BASEURL}/dexaattendance_security`;

export default defineConfig({
  schema: [
    './apps/security/src/database/schema',
    './libs/common/src/index.ts'
  ],
  out: './apps/security/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString!,
  },
});
