import 'dotenv/config';

import sql, { config as SQLConfig, ConnectionPool, PreparedStatement, Request } from 'mssql';

export default class Database {
    private static pool: ConnectionPool | null = null;
    private static connecting: boolean = false;
    public static config: SQLConfig | null = null;

    public static async Connect(): Promise<ConnectionPool> {
        Database.config = {
            user: "sa",
            password: "B1Admin*",
            database: "SoluoneCalendar",
            server: "localhost",
            options: {
              trustServerCertificate: true
            }
          }

        try {
            if (!Database.config) {
                throw new Error("Database configuration is not set");
            }
    
            if (Database.pool) return Database.pool;
    
            if (Database.connecting) {
                while (Database.connecting) {
                    await new Promise(res => setTimeout(res, 100));
                }
                if (Database.pool) return Database.pool;
            }
    
            Database.connecting = true;
    
            Database.pool = await sql.connect(Database.config);
            console.log('Conectado a la base de datos');
            
            return Database.pool;
        } catch (err) {
            console.error('Error al conectar:', err);
            throw err;
        } finally {
            Database.connecting = false;
        }
    }

    public static async executeQuery<T = any>(
        query: string,
        parameters?: Record<string, any>
    ): Promise<T[]> {
        try {
            const pool = await Database.Connect();
            const request = Database.buildRequest(pool.request(), parameters);
            const result = await request.query<T>(query);
            return result.recordset;
        } catch (err) {
            console.error('Error en consulta simple:', err);
            throw err;
        }
    }

    public static async executePreparedQuery<T = any>(
        query: string,
        parameterTypes: Record<string, () => sql.ISqlType>,
        values: Record<string, any>
    ): Promise<T[]> {
        let ps: PreparedStatement | null = null;
        try {
            const pool = await Database.Connect();
            ps = new sql.PreparedStatement(pool);

            for (const [key, typeFactory] of Object.entries(parameterTypes)) {
                ps.input(key, typeFactory());
            }

            await ps.prepare(query);
            const result = await ps.execute(values);
            return result.recordset;
        } catch (err) {
            console.error('Error en consulta preparada:', err);
            throw err;
        } finally {
            if (ps) {
                try {
                    await ps.unprepare();
                } catch (cleanupErr) {
                    console.warn('Error al liberar consulta preparada:', cleanupErr);
                }
            }
        }
    }

    public static async executePreparedNonQuery(
        query: string,
        parameterTypes: Record<string, () => sql.ISqlType>,
        values: Record<string, any>
    ): Promise<number> {
        let ps: PreparedStatement | null = null;
        try {
          console.log(query)
            const pool = await Database.Connect();
            ps = new sql.PreparedStatement(pool);

            for (const [key, typeFactory] of Object.entries(parameterTypes)) {
                ps.input(key, typeFactory());
            }

            await ps.prepare(query);
            const result = await ps.execute(values);
            return result.rowsAffected[0] || 0;
        } catch (err) {
            console.error('Error en consulta modificadora:', err);
            throw err;
        } finally {
            if (ps) {
                try {
                    await ps.unprepare();
                } catch (cleanupErr) {
                    console.warn('Error al liberar consulta preparada:', cleanupErr);
                }
            }
        }
    }

    private static buildRequest(request: Request, parameters?: Record<string, any>): Request {
        if (parameters) {
            for (const [key, value] of Object.entries(parameters)) {
                request.input(key, value);
            }
        }
        return request;
    }

    public static async Close(): Promise<void> {
        if (Database.pool) {
            await Database.pool.close();
            Database.pool = null;
            console.log('Conexión cerrada');
        }
    }
}
