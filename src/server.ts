import { WebSocketServer } from 'ws';
import { requestHandler } from './handler';
import { httpServer } from './http_server';
import { Players } from './players';
import { Rooms } from './rooms';

const HTTP_PORT = 8181;
const SERVER_PORT = 3000;
const HOST = 'localhost';

const players = new Players();
const rooms = new Rooms();

console.log(
  `Start static http server with port: ${HTTP_PORT} and host: ${HOST}`,
);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: SERVER_PORT, host: HOST });

wss.on('connection', (ws) => {
  console.log('New Connection');

  ws.on('message', (data) => {
    console.log(`Received message from client ${data}`);
    requestHandler(data.toString(), ws, players, rooms);
  });
});
console.log(
  `Start websocket server with port: ${SERVER_PORT} and host: ${HOST}`,
);
