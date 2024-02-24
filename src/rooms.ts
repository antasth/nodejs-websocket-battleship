import { IRoom } from './types';

export class Rooms {
  private roomsList: IRoom[] = [];

  createRoom(room: IRoom) {
    this.roomsList.push(room);
  }

  getRoomsList() {
    return this.roomsList;
  }
}
