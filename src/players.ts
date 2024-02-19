import { IPlayer } from './types';

export class Players {
  private playersList: IPlayer[] = [];

  addPlayer(player: IPlayer) {
    this.playersList.push(player);
  }

  getPlayer(login: string) {
    return this.playersList.find((player) => player.login === login);
  }

  getPlayersList() {
    return this.playersList;
  }
}
