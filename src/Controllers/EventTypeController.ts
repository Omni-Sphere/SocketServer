import EventTypeRepository from '../Repositories/EventTypeRepository';

export class EventTypeController {
  private repo: EventTypeRepository;

  constructor() {
    this.repo = new EventTypeRepository();
  }

  public async getAll() {
    return await this.repo.getAll();
  }
}
