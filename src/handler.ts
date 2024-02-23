import { WebSocket } from 'ws';
import { Players } from './players';
import { Rooms } from './rooms';

export const requestHandler = (
  data: string,
  ws: WebSocket,
  players: Players,
  rooms: Rooms,
) => {
  const message = JSON.parse(data);
  switch (message.type) {
    case 'reg':
      regNewUser(data, ws, players);
      break;

    case 'create_room':
      console.log('room creation');
      createRoom(ws, rooms, players);
      break;

    default:
      break;
  }
};

const regNewUser = (data: string, ws: WebSocket, players: Players): void => {
  const message = JSON.parse(data);
  const messageData = JSON.parse(message.data);
  if (!players.playerValidation(messageData.name)) {
    players.addPlayer({
      id: players.getPlayersList().length + 1,
      login: messageData.name,
      password: messageData.password,
    });
  } else {
    console.log(
      `Validation error: Player with name ${messageData.name} already registered`,
    );
    return;
  }

  const player = players.getPlayer(messageData.name);

  const response = JSON.stringify({
    type: 'reg',
    data: `{"name":"${player?.login}","index":${player?.id},"error":false}`,
    id: 0,
  });

  ws.send(response);
  console.log(`Registration result: message send to client ${response}`);
};

const createRoom = (ws: WebSocket, rooms: Rooms, players: Players) => {
  const roomIndex = rooms.getRoomsList().length + 1;
  rooms.addRoom({ indexRoom: roomIndex });

  const player = players.getPlayersList()[0];
  const response = JSON.stringify({
    type: 'update_room',
    data: `[{"roomId":${roomIndex},"roomUsers":[{"name":"${player.login}","index":0}]}]`,
    id: 0,
  });
  ws.send(response);
  console.log(`Create room result: message send to client ${response}`);
};
