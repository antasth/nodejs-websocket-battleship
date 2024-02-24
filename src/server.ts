import crypto from 'crypto';
import { WebSocketServer } from 'ws';
import { requestHandler } from './handler';
import { httpServer } from './http_server';
import { Players } from './players';
import { IConnections } from './types';
import { Rooms } from './rooms';

const HTTP_PORT = 8181;
const SERVER_PORT = 3000;
const HOST = 'localhost';

const players = new Players();
const rooms = new Rooms();
const connections: IConnections = {};

const handleClose = (uuid: string) => {
  const player = players.getPlayer(uuid);
  console.log(`Player ${player.login} is disconnected`);
  players.removePlayer(uuid);
};

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

    requestHandler(message.toString(), connections, uuid, players, rooms);
  });

  connection.on('close', () => handleClose(uuid));
});
console.log(
  `Start websocket server with port: ${SERVER_PORT} and host: ${HOST}`,
);
