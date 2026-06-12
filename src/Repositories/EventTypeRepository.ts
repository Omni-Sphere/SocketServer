import Database from '../Utilities/Database';

export default class EventTypeRepository {
  public async getAll(): Promise<any[]> {
    return await Database.executeQuery<any>(`
      SELECT Code, Name
      FROM EventTypes
    `);
  }
}
