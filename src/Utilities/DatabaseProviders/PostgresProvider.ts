import { Pool } from 'pg';
import { IDatabaseProvider } from './IDatabaseProvider';
import { SqlParser } from './SqlParser';

export class PostgresProvider implements IDatabaseProvider {
    private pool: Pool | null = null;

    public async Connect() {
        if (!this.pool) {
            this.pool = new Pool({
                host: process.env.DB_SERVER || 'localhost',
                user: process.env.DB_USER || 'sa',
                password: process.env.DB_PASSWORD || 'B1Admin*',
                database: process.env.DB_NAME || 'SoluoneCalendar',
                port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432
            });
            console.log('Conectado a PostgreSQL');
        }
        return this.pool;
    }

    public async Close(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            console.log('Conexión PostgreSQL cerrada');
        }
    }

    public async executeQuery<T = any>(query: string, parameters?: Record<string, any>): Promise<T[]> {
        console.log(`\n[SQL QUERY (Postgres)] ${query.trim()}`);
        if (parameters) console.log(`[SQL PARAMS]`, parameters);

        const pool = await this.Connect();
        const parsed = SqlParser.toPostgres(query, parameters);
        const result = await pool.query(parsed.text, parsed.values);
        return result.rows as T[];
    }

    public async executePreparedQuery<T = any>(query: string, values: Record<string, any>): Promise<T[]> {
        return this.executeQuery<T>(query, values);
    }

    public async executePreparedNonQuery(query: string, values: Record<string, any>): Promise<number> {
        console.log(`\n[SQL PREPARED NON-QUERY (Postgres)] ${query.trim()}`);
        console.log(`[SQL PARAMS]`, values);

        const pool = await this.Connect();
        const parsed = SqlParser.toPostgres(query, values);
        const result = await pool.query(parsed.text, parsed.values);
        return result.rowCount || 0;
    }
}
