/**
 * Iterative Depth-First Search (Recursive Backtracker) maze generator.
 *
 * Carves a perfect maze (spanning tree — no loops, all cells reachable)
 * using an explicit stack so arbitrarily large mazes never overflow the
 * JavaScript call stack.
 *
 * Time complexity:  O(W × H) — every cell is visited exactly once.
 * Space complexity: O(W × H) — for the visited array and the stack.
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, carvePassage, markCell } from '../utils/grid';
import { createRandom, shuffle } from '../utils/random';

/** Cardinal directions as [rowDelta, colDelta] pairs. */
const DIRECTIONS: [number, number][] = [
  [-1, 0], // up
  [1, 0],  // down
  [0, -1], // left
  [0, 1],  // right
];

/**
 * DFS maze generator implementing the Strategy pattern via IMazeGenerator.
 */
export class DFSGenerator implements IMazeGenerator {
  /**
   * Generates a perfect maze using iterative DFS.
   *
   * @param config - Validated maze configuration.
   * @returns MazeMatrix where 0 = wall, 1 = passage.
   */
  generate(config: MazeConfig): MazeMatrix {
    const { width, height, seed } = config;
    const random = createRandom(seed);
    const grid = createGrid(width, height);

    // Track which cells have been incorporated into the maze
    const visited: boolean[][] = Array.from(
      { length: height },
      () => new Array<boolean>(width).fill(false),
    );

    // Start from the top-left cell (0, 0)
    const stack: [number, number][] = [[0, 0]];
    visited[0][0] = true;
    markCell(grid, 0, 0);

    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      if (top === undefined) break;
      const [row, col] = top;

      // Randomise the order of directions for this step
      const dirs: [number, number][] = [...DIRECTIONS];
      shuffle(dirs, random);

      let moved = false;

      for (const [dr, dc] of dirs) {
        const nr = row + dr;
        const nc = col + dc;

        if (
          nr >= 0 && nr < height &&
          nc >= 0 && nc < width &&
          !visited[nr][nc]
        ) {
          visited[nr][nc] = true;
          carvePassage(grid, row, col, nr, nc);
          stack.push([nr, nc]);
          moved = true;
          break;
        }
      }

      if (!moved) {
        stack.pop();
      }
    }

    return grid;
  }
}
