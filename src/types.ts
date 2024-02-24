import WebSocket from 'ws';

export interface IPlayer {
  login: string;
  password: string;
}

export interface IRoom {
  player1Id: string;
  player2Id?: string;
}

export interface IConnections {
  [uuid: string]: WebSocket;
}
