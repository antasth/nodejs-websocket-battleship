import WebSocket from 'ws';

const port = 4000;

const ws = new WebSocket(`ws://localhost:${port}`);

ws.on('open', () => {
  console.log('Client connected');

  ws.send(`Hi, this is a client! `);
});

ws.on('message', (data) => {
  console.log(`Received a message ${data}`);
});
