/**
 * Growing Tree maze generator.
 *
 * A meta-algorithm that unifies DFS and Prim's through a configurable cell
 * selection strategy. An "active" list is seeded with one random cell. On
 * each step a cell is chosen from the list; if it has unvisited neighbours
 * one is carved to and added to the active list. When a cell has no more
 * unvisited neighbours it is removed (swap-and-pop, O(1)).
 *
 * Selection strategy (applied each step, hard-wired to a 50 / 50 mix):
 *   - 50 % of the time: pick the NEWEST cell (last added) → DFS-like
 *                       behaviour: long winding corridors.
 *   - 50 % of the time: pick a RANDOM cell → Prim's-like behaviour:
 *                       organic, evenly branching passages.
 * The blend produces mazes that are visually richer than either extreme.
 *
 * Time complexity:  O(W × H) — each cell enters and leaves the active list
 *                   exactly once.
 * Space complexity: O(W × H) — for the visited array and the active list.
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
 * Growing Tree maze generator implementing the Strategy pattern via IMazeGenerator.
 */
export class GrowingTreeGenerator implements IMazeGenerator {
  private _run(
    config: MazeConfig,
    onStep?: (grid: MazeMatrix) => void,
  ): MazeMatrix {
    const { width, height, seed } = config;
    const random = createRandom(seed);
    const grid = createGrid(width, height);

    const visited: boolean[][] = Array.from(
      { length: height },
      () => new Array<boolean>(width).fill(false),
    );

    // Seed from a random cell to avoid corner bias
    const startRow = Math.floor(random() * height);
    const startCol = Math.floor(random() * width);

    visited[startRow][startCol] = true;
    markCell(grid, startRow, startCol);

    // Active list: cells that may still have unvisited neighbours
    const active: [number, number][] = [[startRow, startCol]];

    while (active.length > 0) {
      // Selection strategy: 50 % newest (DFS-like), 50 % random (Prim's-like)
      const index =
        random() < 0.5
          ? active.length - 1
          : Math.floor(random() * active.length);

      const cell = active[index];
      if (cell === undefined) break;
      const [row, col] = cell;

      // Collect unvisited neighbours in a random order
      const neighbours: [number, number][] = [];
      for (const [dr, dc] of DIRECTIONS) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < height && nc >= 0 && nc < width && !visited[nr][nc]) {
          neighbours.push([nr, nc]);
        }
      }

      if (neighbours.length > 0) {
        // Pick one neighbour at random and carve to it
        const ni = Math.floor(random() * neighbours.length);
        const neighbour = neighbours[ni];
        if (neighbour === undefined) break;
        const [nr, nc] = neighbour;

        visited[nr][nc] = true;
        carvePassage(grid, row, col, nr, nc);
        onStep?.(grid);
        active.push([nr, nc]);
      } else {
        // No unvisited neighbours — remove this cell via swap-and-pop (O(1))
        active[index] = active[active.length - 1] as [number, number];
        active.pop();
      }
    }

    return grid;
  }

  /**
   * Generates a perfect maze using the Growing Tree algorithm with a
   * 50 / 50 newest-vs-random cell selection mix.
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
