import { WebSocketServer as WSServer, WebSocket } from 'ws';

interface WSResponse {
  action: string;
  status?: 'ok' | 'error' | 'created' | 'updated' | 'deleted' | 'sync';
  data?: any;
  message?: string;
  requestId?: string;
}

export default class SocketServer {
  private wss: WSServer;

  constructor(private port: number) {
    this.wss = new WSServer({ port: this.port });
  }

  public broadcastSync(data: any): void {
    const message: WSResponse = { action: 'sync', status: 'sync', data };
    const messageStr = JSON.stringify(message);

    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  public start(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New client connected to WebSocket Server');
      
      ws.on('message', (message) => {
        // Optional: Handle basic ping/pong or simply ignore messages 
        // since the API handles CRUD via GraphQL now.
        console.log('Received message from client, ignoring (GraphQL handles CRUD)');
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });

    setInterval(() => {
      const count = Array.from(this.wss.clients).filter(c => c.readyState === c.OPEN).length;
      console.log(`Clientes conectados: ${count}`);
    }, 30000);

    console.log(`WebSocket server started on ws://localhost:${this.port}`);
  }
}
