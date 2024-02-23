import { IPlayer } from './types';

export class Players {
  private playersList: IPlayer[] = [];

  playerValidation(login: string) {
    if (this.playersList.some((player) => player.login === login)) {
      console.log('player is found');
      return true;
    }
    return false;
  }

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
