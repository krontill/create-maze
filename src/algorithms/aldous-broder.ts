/**
 * Aldous-Broder uniform spanning tree maze generator.
 *
 * Performs a random walk across the grid. When the walk steps onto an
 * unvisited cell, the wall between the previous cell and the new cell is
 * removed. Continues until every cell has been visited at least once.
 *
 * Because every cell is reached by the first step of the walk that lands on
 * it, and a simple random walk has no memory, the resulting tree is drawn
 * uniformly at random from all spanning trees of the grid — identical to
 * Wilson's algorithm in output distribution.
 *
 * Time complexity:  O(W × H × log(W × H)) expected — governed by the cover
 *                   time of an unbiased random walk on the grid graph.
 * Space complexity: O(W × H) — for the visited array.
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, carvePassage, markCell, deepCopyMatrix } from '../utils/grid';
import { createRandom } from '../utils/random';

/** Cardinal directions as [rowDelta, colDelta] pairs. */
const DIRECTIONS: [number, number][] = [
  [-1, 0], // up
  [1, 0],  // down
  [0, -1], // left
  [0, 1],  // right
];

/**
 * Aldous-Broder maze generator implementing the Strategy pattern via
 * IMazeGenerator.
 */
export class AldousBroderGenerator implements IMazeGenerator {
  private _run(
    config: MazeConfig,
    onStep?: (grid: MazeMatrix) => void,
  ): MazeMatrix {
    const { width, height, seed } = config;
    const random = createRandom(seed);
    const grid = createGrid(width, height);

    const total = width * height;

    // Track which cells have been incorporated into the maze
    const visited: boolean[][] = Array.from(
      { length: height },
      () => new Array<boolean>(width).fill(false),
    );

    // Pick a random starting cell
    let row = Math.floor(random() * height);
    let col = Math.floor(random() * width);
    visited[row][col] = true;
    markCell(grid, row, col);
    let visitedCount = 1;

    while (visitedCount < total) {
      // Pick a random direction
      const dirIndex = Math.floor(random() * DIRECTIONS.length);
      const dir = DIRECTIONS[dirIndex];
      if (dir === undefined) continue;
      const [dr, dc] = dir;

      const nextRow = row + dr;
      const nextCol = col + dc;

      // Stay within bounds
      if (nextRow < 0 || nextRow >= height || nextCol < 0 || nextCol >= width) {
        continue;
      }

      if (!visited[nextRow][nextCol]) {
        // First visit: carve a passage from current cell to the new cell
        carvePassage(grid, row, col, nextRow, nextCol);
        visited[nextRow][nextCol] = true;
        visitedCount++;
        onStep?.(grid);
      }

      row = nextRow;
      col = nextCol;
    }

    return grid;
  }

  /**
   * Generates a perfect maze using the Aldous-Broder algorithm.
   *
   * @param config - Validated maze configuration.
   * @returns MazeMatrix where 0 = wall, 1 = passage.
   */
  generate(config: MazeConfig): MazeMatrix {
    return this._run(config);
  }

  steps(config: MazeConfig): MazeMatrix[] {
    const snapshots: MazeMatrix[] = [];
    this._run(config, (grid) => snapshots.push(deepCopyMatrix(grid)));
    return snapshots;
  }
}
