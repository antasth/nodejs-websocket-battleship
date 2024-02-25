import { IGame, IShips } from './types';

export class Games {
  private gamesList: IGame[] = [];

  createGame(gameId: string) {
    this.gamesList.push({ gameId, players: [] });
  }

  addPlayerToGame(gameId: string, ships: IShips[], indexPlayer: string) {
    const game = this.gamesList.find((game) => game.gameId === gameId);

    if (game?.players) {
      game.players.push({
        uuid: indexPlayer,
        ships,
      });
    }
  }

  getGame(gameId: string) {
    return this.gamesList.find((game) => game.gameId === gameId);
  }

  getGames() {
    return this.gamesList;
  }
}
