import WebSocket from 'ws';

export interface IPlayer {
  login: string;
  password: string;
}

export interface IRoom {
  roomId: string;
  roomUsers: IRoomUser[];
}

export interface IRoomUser {
  name: string;
  index: string;
}

export interface IConnections {
  [uuid: string]: WebSocket;
}

export interface IGame {
  gameId: string;
  players?: IPlayers[];
}

export interface IPlayers {
  uuid: string;
  ships: IShips[];
}

export interface IShips {
  position: IShipPosition;
  direction: boolean;
  type: string;
  length: number;
}

export interface IShipPosition {
  x: number;
  y: number;
}
