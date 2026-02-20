import SocketServer from './src/Utilities/SocketServer'

const server = new SocketServer(9091);
server.start();
