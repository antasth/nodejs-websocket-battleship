import crypto from 'crypto';
import { Games } from './games';
import { Players } from './players';
import { Rooms } from './rooms';
import { IConnections } from './types';

export const requestHandler = (
  data: string,
  connections: IConnections,
  uuid: string,
  players: Players,
  rooms: Rooms,
  games: Games,
) => {
  const message = JSON.parse(data);
  switch (message.type) {
    case 'reg':
      regNewUser(message.data, uuid, players, connections, rooms);
      break;

    case 'create_room':
      createRoom(uuid, connections, rooms, players);
      break;

    case 'add_user_to_room':
      addUserToRoom(message.data, connections, rooms, players, games, uuid);
      break;

    case 'add_ships':
      addPlayerShipsToGame(message.data, games, connections);
      break;

    default:
      break;
  }
};

const addPlayerShipsToGame = (
  data: string,
  games: Games,
  connections: IConnections,
) => {
  const message = JSON.parse(data);
  console.log('message', message);
  const { gameId, ships, indexPlayer } = message;
  games.addPlayerToGame(gameId, ships, indexPlayer);
  broadcastStartedGames(connections, games);
};

const addUserToRoom = (
  data: string,
  connections: IConnections,
  rooms: Rooms,
  players: Players,
  games: Games,
  uuid: string,
) => {
  const message = JSON.parse(data);
  const roomId = message.indexRoom;
  const player = players.getPlayer(uuid);

  rooms.addPlayer(roomId, uuid, player);

  const room = rooms.getRoom(roomId);
  const idGame = crypto.randomBytes(16).toString('hex');
  games.createGame(idGame);

  room?.roomUsers.forEach((user) => {
    const connection = connections[user.index];
    const startGameResponse = JSON.stringify({
      type: 'create_game',
      data: JSON.stringify({
        idGame,
        idPlayer: user.index,
      }),
      id: 0,
    });
    connection.send(startGameResponse);
  });
};

const broadcastAvialibleRooms = (connections: IConnections, rooms: Rooms) => {
  const avialibleRoomsList = rooms
    .getRoomsList()
    .filter((room) => room.roomUsers.length < 2);

  const message = JSON.stringify({
    type: 'update_room',
    data: JSON.stringify(avialibleRoomsList),
    id: '0',
  });
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid];
    connection.send(message);
  });
};

const broadcastStartedGames = (connections: IConnections, games: Games) => {
  const gamesToStart = games
    .getGames()
    .filter((game) => game.players?.length === 2);

  if (gamesToStart.length) {
    gamesToStart.forEach((game) => {
      game.players?.forEach((player) => {
        const connection = connections[player.uuid];

        const message = JSON.stringify({
          type: 'start_game',
          data: JSON.stringify({
            ships: player.ships,
            currentPlayerIndex: player.uuid,
          }),
          id: 0,
        });

        connection.send(message);
      });
    });
    console.log(`Game start result: messages start_game send to clients`);
  }
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
};
