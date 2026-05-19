/**
 * Shared test helpers for maze-builder tests.
 */

import type { MazeMatrix } from '../src/types';

/**
 * BFS connectivity check: verifies all W×H cells are reachable
 * from the start cell (0,0) through carved passages.
 *
 * Returns true if the maze is fully connected (perfect maze property).
 */
export function isFullyConnected(
  matrix: MazeMatrix,
  width: number,
  height: number,
): boolean {
  const visited = new Set<number>();
  const queue: [number, number][] = [[0, 0]];
  visited.add(0);

  const DIRECTIONS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (queue.length > 0) {
    const entry = queue.shift();
    if (entry === undefined) break;
    const [r, c] = entry;

    for (const [dr, dc] of DIRECTIONS) {
      const nr = r + dr;
      const nc = c + dc;
      const id = nr * width + nc;

      if (
        nr >= 0 && nr < height &&
        nc >= 0 && nc < width &&
        !visited.has(id)
      ) {
        const wallRow = r + nr + 1;
        const wallCol = c + nc + 1;
        if (matrix[wallRow]?.[wallCol] === 1) {
          visited.add(id);
          queue.push([nr, nc]);
        }
      }
    }
  }

  return visited.size === width * height;
}
