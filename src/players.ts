import { IPlayer } from './types';

export class Players {
  private playersList: Record<string, IPlayer> = {};

  playerValidation(login: string) {
    for (const playerId in this.playersList) {
      if (this.playersList[playerId].login === login) {
        return false;
      }
    }
    return true;
  }

  addPlayer(uuid: string, player: IPlayer) {
    this.playersList[uuid] = player;
  }

  getPlayer(uuid: string): IPlayer {
    return this.playersList[uuid];
  }

  getPlayersList() {
    return this.playersList;
  }
}
