import express from 'express';
import cors from 'cors';
import { createHandler } from 'graphql-http/lib/use/express';
import SocketServer from './src/Utilities/SocketServer';
import { schema, root } from './src/GraphQL/Schema';

const EXPRESS_PORT = 9090;
const SOCKET_PORT = 9091;

// Initialize WebSocket server (only for broadcasting sync messages)
const socketServer = new SocketServer(SOCKET_PORT);
socketServer.start();

// Initialize Express server for the GraphQL API
const app = express();

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`\n[HTTP] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('[HTTP BODY]', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Set up GraphQL endpoint and pass the socketServer in the context
app.all(
  '/graphql',
  createHandler({
    schema,
    rootValue: root,
    context: () => ({ socketServer }) // Passed to GraphQL resolvers
  })
);

app.listen(EXPRESS_PORT, () => {
  console.log(`Express server started on http://localhost:${EXPRESS_PORT}`);
  console.log(`GraphQL endpoint available at http://localhost:${EXPRESS_PORT}/graphql`);
});
