import { IRoom } from './types';

export class Rooms {
  private roomsList: IRoom[] = [];

  addRoom(room: IRoom) {
    this.roomsList.push(room);
  }

  getRoom(roomNumber: number) {
    return this.roomsList.find((room) => room.indexRoom === roomNumber);
  }

  getRoomsList() {
    return this.roomsList;
  }
}
