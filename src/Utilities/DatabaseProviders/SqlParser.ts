export class SqlParser {
    /**
     * Replaces SQL Server `@param` bindings with MySQL `:param` bindings.
     * Requires `namedPlaceholders: true` in mysql2.
     */
    public static toMysql(query: string): string {
        return query.replace(/@([a-zA-Z0-9_]+)/g, ':$1');
    }

    /**
     * Replaces SQL Server `@param` bindings with PostgreSQL `$1`, `$2` bindings.
     * Returns the transformed query and the correctly ordered array of values.
     */
    public static toPostgres(query: string, values: Record<string, any> = {}): { text: string, values: any[] } {
        const pgValues: any[] = [];
        let index = 1;
        const text = query.replace(/@([a-zA-Z0-9_]+)/g, (match, paramName) => {
            pgValues.push(values[paramName]);
            return `$${index++}`;
        });
        return { text, values: pgValues };
    }
}
