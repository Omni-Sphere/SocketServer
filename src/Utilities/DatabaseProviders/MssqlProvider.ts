import sql, { ConnectionPool, Request } from 'mssql';
import { IDatabaseProvider } from './IDatabaseProvider';

export class MssqlProvider implements IDatabaseProvider {
    private pool: ConnectionPool | null = null;
    private connecting: boolean = false;

    public async Connect(): Promise<ConnectionPool> {
        const config: sql.config = {
            user: process.env.DB_USER || "sa",
            password: process.env.DB_PASSWORD || "B1Admin*",
            database: process.env.DB_NAME || "SoluoneCalendar",
            server: process.env.DB_SERVER || "localhost",
            options: {
                trustServerCertificate: true
            }
        };

        try {
            if (this.pool) return this.pool;

            if (this.connecting) {
                while (this.connecting) {
                    await new Promise(res => setTimeout(res, 100));
                }
                if (this.pool) return this.pool;
            }

            this.connecting = true;
            this.pool = await sql.connect(config);
            console.log('Conectado a la base de datos SQL Server (MSSQL)');
            return this.pool;
        } catch (err) {
            console.error('Error al conectar MSSQL:', err);
            throw err;
        } finally {
            this.connecting = false;
        }
    }

    public async Close(): Promise<void> {
        if (this.pool) {
            await this.pool.close();
            this.pool = null;
            console.log('Conexión MSSQL cerrada');
        }
    }

    private async buildRequest(parameters?: Record<string, any>): Promise<Request> {
        const pool = await this.Connect();
        const request = pool.request();
        if (parameters) {
            for (const [key, value] of Object.entries(parameters)) {
                request.input(key, value);
            }
        }
        return request;
    }

    public async executeQuery<T = any>(query: string, parameters?: Record<string, any>): Promise<T[]> {
        try {
            console.log(`\n[SQL QUERY (MSSQL)] ${query.trim()}`);
            if (parameters) console.log(`[SQL PARAMS]`, parameters);
            
            const request = await this.buildRequest(parameters);
            const result = await request.query<T>(query);
            return result.recordset;
        } catch (err) {
            console.error('Error en executeQuery MSSQL:', err);
            throw err;
        }
    }

    public async executePreparedQuery<T = any>(query: string, values: Record<string, any>): Promise<T[]> {
        try {
            console.log(`\n[SQL PREPARED (MSSQL)] ${query.trim()}`);
            console.log(`[SQL PARAMS]`, values);

            const request = await this.buildRequest(values);
            const result = await request.query<T>(query);
            return result.recordset;
        } catch (err) {
            console.error('Error en executePreparedQuery MSSQL:', err);
            throw err;
        }
    }

    public async executePreparedNonQuery(query: string, values: Record<string, any>): Promise<number> {
        try {
            console.log(`\n[SQL PREPARED NON-QUERY (MSSQL)] ${query.trim()}`);
            console.log(`[SQL PARAMS]`, values);

            const request = await this.buildRequest(values);
            const result = await request.query(query);
            return result.rowsAffected[0] || 0;
        } catch (err) {
            console.error('Error en executePreparedNonQuery MSSQL:', err);
            throw err;
        }
    }
}
