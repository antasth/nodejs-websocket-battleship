import { IGame, IShips } from './types';
import { createShipsMatrix } from './utils';

export class Games {
  private gamesList: IGame[] = [];

  createGame(gameId: string) {
    this.gamesList.push({ gameId, players: [] });
  }

  changePlayersTurn(gameId: string) {
    this.gamesList
      .find((game) => game.gameId === gameId)
      ?.players?.forEach((player) => (player.turn = !player.turn));
  }

  foundGameWinner(gameId: string | undefined, uuid: string): string | boolean {
    const game = this.gamesList.find((game) => game.gameId === gameId);
    const shipsMatrix = game?.players?.find(
      (player) => player.uuid === uuid,
    )?.shipsMatrix;

    const filteredMatrix = shipsMatrix?.filter((item) => item.includes(1));

    if (filteredMatrix?.length) {
      return false;
    }

    return game?.players?.find((player) => player.uuid !== uuid)?.uuid ?? false;
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
  }

  getGame(gameId: string) {
    return this.gamesList.find((game) => game.gameId === gameId);
  }

  getGames() {
    return this.gamesList;
  }
}
