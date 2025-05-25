import sql from 'mssql';
import { CalendarEvent } from '../Types/CalendarEvent';
import Database from '../Utilities/Database';

export default class EventRepository {
  public async getAll(): Promise<CalendarEvent[]> {
    const result = await Database.executeQuery<any>(`
      SELECT 
        e.EventEntry,
        convert(varchar, e.EventStartDate, 23) EventStartDate,
        convert(varchar, e.EventEndDate, 23) EventEndDate,
        e.EventType,
        c.ConsultantEntry,
        c.ConsultantName
      FROM CalendarEvents e
      INNER JOIN Consultants c ON e.ConsultantEntry = c.ConsultantEntry
    `);

    return result.map(r => ({
      EventEntry: r.EventEntry,
      EventStartDate: r.EventStartDate,
      EventEndDate: r.EventEndDate,
      EventType: r.EventType,
      Consultant: {
        ConsultantEntry: r.ConsultantEntry,
        ConsultantName: r.ConsultantName
      }
    }));
  }

  public async getById(id: number): Promise<CalendarEvent | null> {
    const result = await Database.executePreparedQuery<any>(
      `
      SELECT 
        e.EventEntry,
        convert(varchar, e.EventStartDate, 23) EventStartDate,
        convert(varchar, e.EventEndDate, 23) EventEndDate,
        e.EventType,
        c.ConsultantEntry,
        c.ConsultantName
      FROM CalendarEvents e
      INNER JOIN Consultants c ON e.ConsultantEntry = c.ConsultantEntry
      WHERE e.EventEntry = @EventEntry
    `,
      { EventEntry: sql.Int },
      { EventEntry: id }
    );

    if (result.length === 0) return null;

    const r = result[0];
    return {
      EventEntry: r.EventEntry,
      EventStartDate: r.EventStartDate,
      EventEndDate: r.EventEndDate,
      EventType: r.EventType,
      Consultant: {
        ConsultantEntry: r.ConsultantEntry,
        ConsultantName: r.ConsultantName
      }
    };
  }

  public async create(event: CalendarEvent): Promise<void> {
    console.log("Entra repositorio para crear", event)
    await Database.executePreparedNonQuery(
      `
      INSERT INTO CalendarEvents (EventEntry, EventStartDate, EventEndDate, ConsultantEntry, EventType)
      VALUES (( SELECT ISNULL(COUNT(*),0) + 1 FROM CalendarEvents ), @EventStartDate, @EventEndDate, @Consultant, @EventType)
    `,
      {
        EventStartDate: sql.VarChar,
        EventEndDate: sql.VarChar,
        Consultant: sql.Int,
        EventType: sql.Char
      },
      {
        EventStartDate: event.EventStartDate,
        EventEndDate: event.EventEndDate,
        Consultant: event.Consultant.ConsultantEntry,
        EventType: event.EventType
      }
    );
  }

  public async update(event: CalendarEvent): Promise<void> {
    await Database.executePreparedNonQuery(
      `
      UPDATE CalendarEvents
      SET EventStartDate = @EventStartDate,
          EventEndDate = @EventEndDate,
          ConsultantEntry = @Consultant,
          EventType = @EventType
      WHERE EventEntry = @EventEntry
    `,
      {
        EventEntry: sql.Int,
        EventStartDate: sql.VarChar,
        EventEndDate: sql.VarChar,
        Consultant: sql.Int,
        EventType: sql.Char
      },
      {
        EventEntry: event.EventEntry,
        EventStartDate: event.EventStartDate,
        EventEndDate: event.EventEndDate,
        Consultant: event.Consultant.ConsultantEntry,
        EventType: event.EventType
      }
    );
  }

  public async delete(event: CalendarEvent): Promise<void> {
    console.log('Delete Service', event)

    await Database.executePreparedNonQuery(
      `
      DELETE FROM CalendarEvents 
        WHERE ConsultantEntry = @ConsultantEntry
        AND EventStartDate = @EventStartDate
        AND EventEndDate = @EventEndDate
        AND EventType = @EventType
      `,
      { 
        ConsultantEntry: sql.Int,
        EventStartDate: sql.VarChar,
        EventEndDate: sql.VarChar,
        EventType: sql.Char
      },
      {
        ConsultantEntry: event.Consultant.ConsultantEntry,
        EventStartDate: event.EventStartDate,
        EventEndDate: event.EventEndDate,
        EventType: event.EventType
      }
    );
  }
}
