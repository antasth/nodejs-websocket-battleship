import { WebSocketServer } from 'ws';
import { httpServer } from './http_server';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const port = 4000;
const wss = new WebSocketServer({ port });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    console.log(`Received message from client ${data}`);
  });
  ws.send('Hello, this is server.ts');
});
console.log(`Listening at ${port}...`);
