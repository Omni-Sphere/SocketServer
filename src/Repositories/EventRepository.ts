import { CalendarEvent } from '../Types/CalendarEvent';
import Database from '../Utilities/Database';
import { EventQueries } from './Queries/EventQueries';

export default class EventRepository {
  public async getAll(): Promise<CalendarEvent[]> {
    const result = await Database.executeQuery<any>(EventQueries.getAll());

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
      EventQueries.getById(),
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
    console.log("Entra repositorio para crear", event);
    await Database.executePreparedNonQuery(
      EventQueries.getCreate(),
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
      EventQueries.getUpdate(),
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
    console.log('Delete Service', event);

    await Database.executePreparedNonQuery(
      EventQueries.getDelete(),
      {
        ConsultantEntry: event.Consultant.ConsultantEntry,
        EventStartDate: event.EventStartDate,
        EventEndDate: event.EventEndDate,
        EventType: event.EventType
      }
    );
  }
}
