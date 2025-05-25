import SocketServer from './src/Utilities/SocketServer'

const server = new SocketServer(8080);
server.start();
