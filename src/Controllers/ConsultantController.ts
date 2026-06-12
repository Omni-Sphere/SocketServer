import ConsultantRepository from '../Repositories/ConsultantRepository';

export class ConsultantController {
  private repo: ConsultantRepository;

  constructor() {
    this.repo = new ConsultantRepository();
  }

  public async getAll() {
    return await this.repo.getAll();
  }
}
