/**
 * Spiral Backtracker maze generator.
 *
 * Variant of iterative DFS (recursive backtracker) that keeps a heading
 * and applies a clockwise turning preference (right, straight, left, back)
 * when selecting the next unvisited neighbour. A random fallback preserves
 * variation while still producing spiral-heavy local structure.
 *
 * Time complexity:  O(W × H) — every cell is visited exactly once.
 * Space complexity: O(W × H) — for the visited matrix and stack.
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, carvePassage, markCell, deepCopyMatrix } from '../utils/grid';
import { createRandom, shuffle } from '../utils/random';

/** Cardinal directions in clockwise order: up, right, down, left. */
const DIRECTIONS: [number, number][] = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

/** Stack entry: row, col, heading direction index. */
type StackEntry = [number, number, number];

/**
 * Spiral Backtracker generator implementing the Strategy pattern.
 */
export class SpiralBacktrackerGenerator implements IMazeGenerator {
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

    const startRow = Math.floor(random() * height);
    const startCol = Math.floor(random() * width);
    const startHeading = Math.floor(random() * DIRECTIONS.length);

    visited[startRow][startCol] = true;
    markCell(grid, startRow, startCol);

    const stack: StackEntry[] = [[startRow, startCol, startHeading]];

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      if (current === undefined) break;

      const [row, col, heading] = current;
      const unvisitedDirections: number[] = [];

      for (let direction = 0; direction < DIRECTIONS.length; direction++) {
        const [dr, dc] = DIRECTIONS[direction] as [number, number];
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < height && nc >= 0 && nc < width && !visited[nr][nc]) {
          unvisitedDirections.push(direction);
        }
      }

      if (unvisitedDirections.length === 0) {
        stack.pop();
        continue;
      }

      const preferredOrder: number[] = [
        (heading + 1) % 4, // turn right (clockwise)
        heading,           // continue straight
        (heading + 3) % 4, // turn left
        (heading + 2) % 4, // backtrack direction
      ];

      const ranked: number[] = [];
      for (const direction of preferredOrder) {
        if (unvisitedDirections.includes(direction)) {
          ranked.push(direction);
        }
      }

      let chosenDirection = ranked[0] as number;
      // Soft bias: mostly follow the preferred turning order, sometimes explore.
      if (ranked.length > 1 && random() >= 0.75) {
        const candidates = [...unvisitedDirections];
        shuffle(candidates, random);
        const candidate = candidates[0];
        if (candidate !== undefined) {
          chosenDirection = candidate;
        }
      }

      const [dr, dc] = DIRECTIONS[chosenDirection] as [number, number];
      const nr = row + dr;
      const nc = col + dc;

      visited[nr][nc] = true;
      carvePassage(grid, row, col, nr, nc);
      onStep?.(grid);
      stack.push([nr, nc, chosenDirection]);
    }

    return grid;
  }

  /**
   * Generates a perfect maze with a directional turning bias.
   *
   * @param config - Validated maze configuration.
   * @returns MazeMatrix where 0 = wall and 1 = passage.
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
