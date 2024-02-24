import { IPlayer, IRoom } from './types';

export class Rooms {
  private roomsList: IRoom[] = [];

  createRoom(room: IRoom) {
    this.roomsList.push(room);
  }

  getRoom(roomId: string) {
    return this.roomsList.find((room) => room.roomId === roomId);
  }

  addPlayer(roomId: string, uuid: string, player: IPlayer) {
    const index = this.roomsList.findIndex((room) => room.roomId === roomId);

    const newPlayer = {
      name: player.login,
      index: uuid,
    };

    this.roomsList[index].roomUsers.push(newPlayer);
    console.log(this.roomsList);
  }

  getRoomsList() {
    return this.roomsList;
  }
}
