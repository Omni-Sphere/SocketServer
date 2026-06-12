import mysql from 'mysql2/promise';
import { IDatabaseProvider } from './IDatabaseProvider';
import { SqlParser } from './SqlParser';

export class MysqlProvider implements IDatabaseProvider {
    private pool: mysql.Pool | null = null;

    public async Connect() {
        if (!this.pool) {
            this.pool = mysql.createPool({
                host: process.env.DB_SERVER || 'localhost',
                user: process.env.DB_USER || 'sa',
                password: process.env.DB_PASSWORD || 'B1Admin*',
                database: process.env.DB_NAME || 'SoluoneCalendar',
                namedPlaceholders: true
            });
            console.log('Conectado a MySQL');
        }
        return this.pool;
    }

    public async Close(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            console.log('Conexión MySQL cerrada');
        }
    }

    public async executeQuery<T = any>(query: string, parameters?: Record<string, any>): Promise<T[]> {
        console.log(`\n[SQL QUERY (MySQL)] ${query.trim()}`);
        if (parameters) console.log(`[SQL PARAMS]`, parameters);

        const pool = await this.Connect();
        const parsedQuery = SqlParser.toMysql(query);
        const [rows] = await pool.execute(parsedQuery, parameters || {});
        return rows as T[];
    }

    public async executePreparedQuery<T = any>(query: string, values: Record<string, any>): Promise<T[]> {
        // En mysql2 execute/query ambos usan sentencias preparadas cuando hay parámetros,
        // así que podemos reutilizar executeQuery.
        return this.executeQuery<T>(query, values);
    }

    public async executePreparedNonQuery(query: string, values: Record<string, any>): Promise<number> {
        console.log(`\n[SQL PREPARED NON-QUERY (MySQL)] ${query.trim()}`);
        console.log(`[SQL PARAMS]`, values);

        const pool = await this.Connect();
        const parsedQuery = SqlParser.toMysql(query);
        const [result] = await pool.execute<mysql.ResultSetHeader>(parsedQuery, values || {});
        return result.affectedRows;
    }
}
