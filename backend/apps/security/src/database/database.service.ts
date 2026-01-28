import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import * as schema from './schema';
import { Pool } from "pg";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
    private pool: Pool;
    public db: NodePgDatabase<typeof schema>;

    constructor() {
        const connectionString = `${process.env.DATABASE_BASEURL}/dexaattendance_security`;

        this.pool = new Pool({ connectionString });
        this.db = drizzle(this.pool, { schema });

        console.log('Database connected');
    }

    async onModuleDestroy() {
        await this.pool.end();
    }

    get schema() {
        return schema;
    }
}