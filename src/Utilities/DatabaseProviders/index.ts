import { IDatabaseProvider } from './IDatabaseProvider';
import { MssqlProvider } from './MssqlProvider';
import { MysqlProvider } from './MysqlProvider';
import { PostgresProvider } from './PostgresProvider';

import 'dotenv/config';

class DatabaseFactory {
    private static instance: IDatabaseProvider | null = null;

    public static getInstance(): IDatabaseProvider {
        if (!DatabaseFactory.instance) {
            const providerName = (process.env.DB_PROVIDER || 'mssql').toLowerCase();

            switch (providerName) {
                case 'mysql':
                    DatabaseFactory.instance = new MysqlProvider();
                    break;
                case 'postgres':
                case 'postgresql':
                case 'pg':
                    DatabaseFactory.instance = new PostgresProvider();
                    break;
                case 'mssql':
                case 'sqlserver':
                default:
                    DatabaseFactory.instance = new MssqlProvider();
                    break;
            }
        }
        return DatabaseFactory.instance;
    }
}

// Exportamos la instancia directamente para mantener retrocompatibilidad con import Database from 'Database'
const Database = DatabaseFactory.getInstance();
export default Database;
