import { WebSocket } from 'ws';
import { Players } from './players';

export const requestHandler = (
  data: string,
  ws: WebSocket,
  players: Players,
) => {
  const message = JSON.parse(data);
  switch (message.type) {
    case 'reg':
      regNewUser(data, ws, players);
      break;

    case 'create_room':
      console.log('room creation');
      break;

    default:
      break;
  }
};

const regNewUser = (data: string, ws: WebSocket, players: Players): void => {
  const message = JSON.parse(data);
  const messageData = JSON.parse(message.data);
  players.addPlayer({
    id: players.getPlayersList().length + 1,
    login: messageData.name,
    password: messageData.password,
  });
  // console.log('players.getPlayers()', players.getPlayersList());

  const player = players.getPlayer(messageData.name);

  const response = JSON.stringify({
    type: 'reg',
    data: `{"name":"${player?.login}","index":${player?.id},"error":false}`,
    id: 0,
  });

  ws.send(response);
  console.log(`Registration result: message send to client ${response}`);
};

// const createRoom = () => {
//   //
// };
