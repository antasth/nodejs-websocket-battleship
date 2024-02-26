import { IGame, IShips } from './types';
import { createShipsMatrix } from './utils';

export class Games {
  private gamesList: IGame[] = [];

  createGame(gameId: string) {
    this.gamesList.push({ gameId, players: [] });
  }

  addPlayerToGame(
    gameId: string,
    ships: IShips[],
    indexPlayer: string,
    turn: boolean,
  ) {
    const game = this.gamesList.find((game) => game.gameId === gameId);
    const shipsMatrix = createShipsMatrix(ships);

    if (game?.players) {
      game.players.push({
        uuid: indexPlayer,
        turn,
        ships,
        shipsMatrix,
      });
    }

    console.log(shipsMatrix);
  }

  getGame(gameId: string) {
    return this.gamesList.find((game) => game.gameId === gameId);
  }

  getGames() {
    return this.gamesList;
  }
}
