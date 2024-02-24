import crypto from 'crypto';
import { Players } from './players';
import { Rooms } from './rooms';
import { IConnections } from './types';

export const requestHandler = (
  data: string,
  connections: IConnections,
  uuid: string,
  players: Players,
  rooms: Rooms,
) => {
  const message = JSON.parse(data);
  switch (message.type) {
    case 'reg':
      regNewUser(message.data, uuid, players, connections);
      break;

    case 'create_room':
      console.log('room creation');
      createRoom(uuid, connections, rooms, players);
      break;

    default:
      break;
  }
};

const createRoom = (
  uuid: string,
  connections: IConnections,
  rooms: Rooms,
  players: Players,
) => {
  const roomId = crypto.randomBytes(16).toString('hex');

  rooms.createRoom(roomId, uuid);
  const player = players.getPlayer(uuid);

  const response = JSON.stringify({
    type: 'update_room',
    data: JSON.stringify([
      {
        roomId,
        roomUsers: [
          {
            name: player.login,
            index: uuid,
          },
        ],
      },
    ]),
    id: 0,
  });

  const connection = connections[uuid];

  connection.send(response);
  console.log(`Create room result: message send to client ${response}`);
};

const regNewUser = (
  data: string,
  uuid: string,
  players: Players,
  connections: IConnections,
) => {
  const message = JSON.parse(data);
  console.log(message);

  console.log(players.playerValidation(message.name));

  if (players.playerValidation(message.name)) {
    const player = {
      login: message.name,
      password: message.password,
    };

    players.addPlayer(uuid, player);
  } else {
    console.log(
      `Validation error: Player with name "${message.name}" already registered`,
    );
    return;
  }
  const player = players.getPlayer(uuid);

  const response = JSON.stringify({
    type: 'reg',
    data: `{"name":"${player?.login}","index":"${uuid}","error":false}`,
    id: 0,
  });

  const connection = connections[uuid];
  connection.send(response);
  console.log(`Registration result: message send to client ${response}`);
  console.log('players', players);
};

// const createRoom = (connection: WebSocket, rooms: Rooms, players: Players) => {
//   const roomIndex = rooms.getRoomsList().length + 1;
//   rooms.addRoom({ indexRoom: roomIndex });

//   const player = players.getPlayersList()[0];
//   const response = JSON.stringify({
//     type: 'update_room',
//     data: `[{"roomId":${roomIndex},"roomUsers":[{"name":"${player.login}","index":0}]}]`,
//     id: 0,
//   });
//   connection.send(response);
//   console.log(`Create room result: message send to client ${response}`);
// };
