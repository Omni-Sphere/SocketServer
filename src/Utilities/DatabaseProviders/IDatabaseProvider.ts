export interface IDatabaseProvider {
    Connect(): Promise<any>;
    Close(): Promise<void>;
    executeQuery<T = any>(query: string, parameters?: Record<string, any>): Promise<T[]>;
    executePreparedQuery<T = any>(query: string, values: Record<string, any>): Promise<T[]>;
    executePreparedNonQuery(query: string, values: Record<string, any>): Promise<number>;
}
