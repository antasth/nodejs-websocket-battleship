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

    case 'attack':
      attackOtherPlayer(message.data, games, rooms, connections);
      break;

    default:
      break;
  }
};

const attackOtherPlayer = (
  data: string,
  games: Games,
  rooms: Rooms,
  connections: IConnections,
) => {
  const message = JSON.parse(data);
  const { x, y, gameId, indexPlayer } = message;
  const game = games.getGame(gameId);

  const attackerId = indexPlayer;
  const attacker = game?.players?.find((player) => player.uuid === attackerId);
  const playerToAttack = game?.players?.find(
    (player) => player.uuid !== indexPlayer,
  );

  if (attacker?.turn && playerToAttack?.shipsMatrix[y][x] === 1) {
    const shotResponse = JSON.stringify({
      type: 'attack',
      data: JSON.stringify({
        position: {
          x,
          y,
        },
        currentPlayer: indexPlayer,
        status: 'shot',
      }),
      id: 0,
    });
    playerToAttack.shipsMatrix[y][x] = 0;

    const connection = connections[indexPlayer];
    connection.send(shotResponse);

    const winner = games.foundGameWinner(gameId, playerToAttack.uuid);

    if (winner) {
      const finishGameResponse = JSON.stringify({
        type: 'finish',
        data: JSON.stringify({
          winPlayer: winner,
        }),
        id: 0,
      });

      game?.players?.forEach((player) => {
        const connection = connections[player.uuid];

        connection.send(finishGameResponse);
        games.removeGame(gameId);
        broadcastAvialibleRooms(connections, rooms);
      });
    }
    sendNowYourTurnMessage(connections, attackerId);
  } else if (attacker?.turn && playerToAttack?.shipsMatrix[y][x] === 0) {
    games.changePlayersTurn(gameId);
    const missResponse = JSON.stringify({
      type: 'attack',
      data: JSON.stringify({
        position: {
          x,
          y,
        },
        currentPlayer: indexPlayer,
        status: 'miss',
      }),
      id: 0,
    });
    const connection = connections[indexPlayer];
    connection.send(missResponse);
    sendNowYourTurnMessage(connections, playerToAttack.uuid);
  }
};

const addPlayerShipsToGame = (
  data: string,
  games: Games,
  connections: IConnections,
) => {
  const message = JSON.parse(data);
  const { gameId, ships, indexPlayer } = message;
  const turn = games.getGame(gameId)?.players?.length === 0;
  games.addPlayerToGame(gameId, ships, indexPlayer, turn);
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
      game.players?.forEach((player, i) => {
        const connection = connections[player.uuid];

        const startMessage = JSON.stringify({
          type: 'start_game',
          data: JSON.stringify({
            ships: player.ships,
            currentPlayerIndex: player.uuid,
          }),
          id: 0,
        });

        if (i === 0) {
          sendNowYourTurnMessage(connections, player.uuid);
        }

        connection.send(startMessage);
      });
    });
    console.log(`Game start result: messages start_game send to clients`);
  }
};

const sendNowYourTurnMessage = (connections: IConnections, uuid: string) => {
  const connection = connections[uuid];

  const turnMessage = JSON.stringify({
    type: 'turn',
    data: JSON.stringify({
      currentPlayer: uuid,
    }),
    id: 0,
  });
  connection.send(turnMessage);
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
