import crypto from 'crypto';
import { WebSocketServer } from 'ws';
import { requestHandler } from './handler';
import { httpServer } from './http_server';
import { IConnections } from './types';
import { Players } from './players';

const HTTP_PORT = 8181;
const SERVER_PORT = 3000;
const HOST = 'localhost';

// const players: Record<string, IPlayer> = {};
const players = new Players();
const connections: IConnections = {};

console.log(
  `Start static http server with port: ${HTTP_PORT} and host: ${HOST}`,
);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: SERVER_PORT, host: HOST });

wss.on('connection', (connection) => {
  const uuid = crypto.randomBytes(16).toString('hex');
  console.log(`New Connection ${uuid}`);

  connection.on('message', (message) => {
    console.log(`Received message from client ${message}`);

    connections[uuid] = connection;

    requestHandler(message.toString(), connections, uuid, players);
  });
});
console.log(
  `Start websocket server with port: ${SERVER_PORT} and host: ${HOST}`,
);
