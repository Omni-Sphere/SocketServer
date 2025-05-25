import { CalendarEvent } from '../Types/CalendarEvent'; 
import EventRepository from '../Repositories/EventRepository';

export class CalendarEventService {
  private repository: EventRepository;

  constructor() {
    this.repository = new EventRepository();
  }

  public async create(event: CalendarEvent): Promise<void> {
    console.log("Inicia event service")
    await this.repository.create(event);
  }

  public async getAll(): Promise<CalendarEvent[]> {
    return await this.repository.getAll();
  }

  public async update(event: CalendarEvent): Promise<void> {
    await this.repository.update(event);
  }

  public async delete(event: CalendarEvent): Promise<void> {
    console.log('Delete entra repo')

    await this.repository.delete(event);
  }
}
