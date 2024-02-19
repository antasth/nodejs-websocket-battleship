import { WebSocketServer } from 'ws';
import { requestHandler } from './handler';
import { httpServer } from './http_server';
import { Players } from './players';

const HTTP_PORT = 8181;
const SERVER_PORT = 3000;

const players = new Players();
console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: SERVER_PORT });

wss.on('connection', (ws) => {
  console.log('New Connection');

  ws.on('message', (data) => {
    // console.log(`Received message from client ${data}`);
    requestHandler(data.toString(), ws, players);
  });
  ws.send('Hello, this is server.ts');
});
console.log(`Listening at ${SERVER_PORT}...`);
