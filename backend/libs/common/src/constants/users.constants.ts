import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum('role', ['USER', 'ADMIN']);