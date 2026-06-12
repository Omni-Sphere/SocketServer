import Database from '../Utilities/Database';

export default class ConsultantRepository {
  public async getAll(): Promise<any[]> {
    return await Database.executeQuery<any>(`
      SELECT ConsultantEntry, ConsultantName
      FROM Consultants
    `);
  }
}
