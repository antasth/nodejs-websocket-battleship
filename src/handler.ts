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
      regNewUser(message.data, uuid, players, connections, rooms);
      break;

    case 'create_room':
      console.log('room creation');
      createRoom(uuid, connections, rooms, players);
      break;

    default:
      break;
  }
};

const broadcastAvialibleRooms = (connections: IConnections, rooms: Rooms) => {
  const roomsList = rooms.getRoomsList();

  const message = JSON.stringify({
    type: 'update_room',
    data: JSON.stringify(roomsList),
    id: '0',
  });
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid];
    connection.send(message);
  });
};

const createRoom = (
  uuid: string,
  connections: IConnections,
  rooms: Rooms,
  players: Players,
) => {
  const roomId = crypto.randomBytes(16).toString('hex');
  const player = players.getPlayer(uuid);

  const room = {
    roomId,
    roomUsers: [
      {
        name: player.login,
        index: uuid,
      },
    ],
  };

  rooms.createRoom(room);

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
  rooms: Rooms,
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
  broadcastAvialibleRooms(connections, rooms);
  console.log(`Registration result: message send to client ${response}`);
  console.log('players', players);
};
