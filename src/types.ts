import WebSocket from 'ws';

export interface IPlayer {
  login: string;
  password: string;
}

export interface IRoom {
  indexRoom: number;
}

export interface IConnections {
  [uuid: string]: WebSocket;
}
