import { IRoom } from './types';

export class Rooms {
  private roomsList: Record<string, IRoom> = {};

  createRoom(roomId: string, uuid: string) {
    this.roomsList[roomId] = { player1Id: uuid };
  }

  getRoomsList() {
    return this.roomsList;
  }
}
