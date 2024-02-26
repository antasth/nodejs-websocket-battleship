import { IShips } from './types';

export const createShipsMatrix = (ships: IShips[]) => {
  const matrix = Array.from({ length: 10 }).map(() => new Array(10).fill(0));
  ships.map((ship) => {
    const x = ship.position.x;
    const y = ship.position.y;

    if (ship.direction) {
      for (let i = y; i < y + ship.length; i++) {
        matrix[i][x] = 1;
      }
    } else {
      for (let i = x; i < x + ship.length; i++) {
        matrix[y][i] = 1;
      }
    }
  });
  return matrix;
};
