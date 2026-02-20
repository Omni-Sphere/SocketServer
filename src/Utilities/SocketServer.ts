import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { CalendarEvent } from '../Types/CalendarEvent';
import { CalendarEventController } from '../Controllers/CalendarEventController';

interface WSMessage {
  action: string;
  data?: any;
  requestId?: string;
}

interface WSResponse {
  action: string;
  status?: 'ok' | 'error' | 'created' | 'updated' | 'deleted' | 'sync';
  data?: any;
  message?: string;
  requestId?: string;
}

export default class SocketServer {
  private wss: WSServer;
  private service: CalendarEventController;

  constructor(private port: number) {
    this.wss = new WSServer({ port: this.port });
    this.service = new CalendarEventController();
  }

  private broadcastChangeExcept(sender: WebSocket, action: string, data: any): void {
    const message: WSResponse = { action, status: 'sync', data };
    const messageStr = JSON.stringify(message);

    this.wss.clients.forEach(client => {
      client.send(messageStr);
    });
  }

  public start(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', async (message) => {
        let parsed: WSMessage;
        try {
          parsed = JSON.parse(message.toString());
        } catch {
          ws.send(JSON.stringify({
            action: 'error',
            status: 'error',
            message: 'Invalid JSON',
          }));
          return;
        }

        const { action, data, requestId } = parsed;

        if (!action) {
          ws.send(JSON.stringify({
            action: 'error',
            status: 'error',
            message: 'Missing action field',
            requestId,
          }));
          return;
        }

        try {
          switch (action) {
            case 'create':
              if (!data) throw new Error('Missing data for create');
              await this.service.create(data as CalendarEvent);
              const allAfterCreate = await this.service.getAll();
              ws.send(JSON.stringify({
                action: 'create',
                status: 'created',
                data: allAfterCreate,
                requestId,
              }));
              this.broadcastChangeExcept(ws, 'sync', allAfterCreate);
              break;

            case 'read':
              const events = await this.service.getAll();
              ws.send(JSON.stringify({
                action: 'read',
                status: 'ok',
                data: events,
                requestId,
              }));
              break;

            case 'update':
              if (!data)
                throw new Error('Missing data for update');

              await this.service.update(data as CalendarEvent);

              console.log("beforeUpdate ", data)
              const allAfterUpdate = await this.service.getAll();
              console.log(allAfterUpdate)
              ws.send(JSON.stringify({
                action: 'update',
                status: 'updated',
                data: allAfterUpdate,
                requestId,
              }));
              this.broadcastChangeExcept(ws, 'sync', allAfterUpdate);
              break;

            case 'delete':
              if (!data) throw new Error('Missing data for delete');
              await this.service.delete(data as CalendarEvent);
              const allAfterDelete = await this.service.getAll();
              ws.send(JSON.stringify({
                action: 'delete',
                status: 'deleted',
                data: allAfterDelete,
                requestId,
              }));
              this.broadcastChangeExcept(ws, 'sync', allAfterDelete);
              break;

            default:
              ws.send(JSON.stringify({
                action,
                status: 'error',
                message: `Unknown action: ${action}`,
                requestId,
              }));
          }
        } catch (error: any) {
          console.error('Error handling message:', error);
          ws.send(JSON.stringify({
            action,
            status: 'error',
            message: error.message,
            requestId,
          }));
        }
      });
    });

    setInterval(() => {
      const count = Array.from(this.wss.clients).filter(c => c.readyState === c.OPEN).length;
      console.log(`Clientes conectados: ${count}`);
    }, 30000);

    console.log(`WebSocket server started on ws://localhost:${this.port}`);
  }
}
