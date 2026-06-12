import 'dotenv/config';

export class EventQueries {
    public static getProvider(): string {
        return (process.env.DB_PROVIDER || 'mssql').toLowerCase();
    }

    public static getAll(): string {
        const provider = this.getProvider();
        if (provider === 'mysql') {
            return `
                SELECT 
                    e.EventEntry,
                    DATE_FORMAT(e.EventStartDate, '%Y-%m-%d') as EventStartDate,
                    DATE_FORMAT(e.EventEndDate, '%Y-%m-%d') as EventEndDate,
                    e.EventType,
                    c.ConsultantEntry,
                    c.ConsultantName
                FROM CalendarEvents e
                INNER JOIN Consultants c ON e.ConsultantEntry = c.ConsultantEntry
            `;
        } else if (provider === 'postgres' || provider === 'pg') {
            return `
                SELECT 
                    e.EventEntry,
                    TO_CHAR(e.EventStartDate, 'YYYY-MM-DD') as EventStartDate,
                    TO_CHAR(e.EventEndDate, 'YYYY-MM-DD') as EventEndDate,
                    e.EventType,
                    c.ConsultantEntry,
                    c.ConsultantName
                FROM CalendarEvents e
                INNER JOIN Consultants c ON e.ConsultantEntry = c.ConsultantEntry
            `;
        } else {
            // MSSQL
            return `
                SELECT 
                    e.EventEntry,
                    convert(varchar, e.EventStartDate, 23) EventStartDate,
                    convert(varchar, e.EventEndDate, 23) EventEndDate,
                    e.EventType,
                    c.ConsultantEntry,
                    c.ConsultantName
                FROM CalendarEvents e
                INNER JOIN Consultants c ON e.ConsultantEntry = c.ConsultantEntry
            `;
        }
    }

    public static getById(): string {
        return this.getAll() + "\n WHERE e.EventEntry = @EventEntry";
    }

    public static getCreate(): string {
        const provider = this.getProvider();
        if (provider === 'mysql') {
            return `
                INSERT INTO CalendarEvents (EventEntry, EventStartDate, EventEndDate, ConsultantEntry, EventType)
                VALUES (( SELECT IFNULL(MAX(ce.EventEntry),0) + 1 FROM CalendarEvents ce ), @EventStartDate, @EventEndDate, @Consultant, @EventType)
            `;
        } else if (provider === 'postgres' || provider === 'pg') {
            return `
                INSERT INTO CalendarEvents (EventEntry, EventStartDate, EventEndDate, ConsultantEntry, EventType)
                VALUES (( SELECT COALESCE(MAX(EventEntry),0) + 1 FROM CalendarEvents ), @EventStartDate, @EventEndDate, @Consultant, @EventType)
            `;
        } else {
            // MSSQL
            return `
                INSERT INTO CalendarEvents (EventEntry, EventStartDate, EventEndDate, ConsultantEntry, EventType)
                VALUES (( SELECT ISNULL(MAX([EventEntry]),0) + 1 FROM CalendarEvents ), @EventStartDate, @EventEndDate, @Consultant, @EventType)
            `;
        }
    }

    public static getUpdate(): string {
        return `
            UPDATE CalendarEvents
            SET EventStartDate = @EventStartDate,
                EventEndDate = @EventEndDate,
                ConsultantEntry = @Consultant,
                EventType = @EventType
            WHERE EventEntry = @EventEntry
        `;
    }

    public static getDelete(): string {
        return `
            DELETE FROM CalendarEvents 
            WHERE ConsultantEntry = @ConsultantEntry
            AND EventStartDate = @EventStartDate
            AND EventEndDate = @EventEndDate
            AND EventType = @EventType
        `;
    }
}
