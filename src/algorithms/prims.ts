/**
 * Randomised Prim's algorithm maze generator.
 *
 * Grows a perfect maze one passage at a time by maintaining a
 * frontier list of candidate walls. A random frontier entry is
 * selected; if its target cell is not yet in the maze, the wall
 * is opened and new frontier entries are added for that cell.
 *
 * Time complexity:  O(W × H) on average — each cell joins the
 *                   frontier exactly once.
 * Space complexity: O(W × H) — frontier list and visited array.
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, carvePassage, markCell } from '../utils/grid';
import { createRandom } from '../utils/random';

/** Cardinal directions as [rowDelta, colDelta] pairs. */
const DIRECTIONS: [number, number][] = [
  [-1, 0], // up
  [1, 0],  // down
  [0, -1], // left
  [0, 1],  // right
];

/**
 * A candidate wall entry: the out-of-maze cell (row, col) and the
 * already-in-maze cell (fromRow, fromCol) it was discovered from.
 */
interface FrontierEntry {
  row: number;
  col: number;
  fromRow: number;
  fromCol: number;
}

/**
 * Prim's maze generator implementing the Strategy pattern via IMazeGenerator.
 */
export class PrimsGenerator implements IMazeGenerator {
  /**
   * Generates a perfect maze using randomised Prim's algorithm.
   *
   * @param config - Validated maze configuration.
   * @returns MazeMatrix where 0 = wall, 1 = passage.
   */
  generate(config: MazeConfig): MazeMatrix {
    const { width, height, seed } = config;
    const random = createRandom(seed);
    const grid = createGrid(width, height);

    const inMaze: boolean[][] = Array.from(
      { length: height },
      () => new Array<boolean>(width).fill(false),
    );

    const frontier: FrontierEntry[] = [];

    /** Enqueue all unvisited orthogonal neighbours of (r, c). */
    const addFrontier = (r: number, c: number): void => {
      for (const [dr, dc] of DIRECTIONS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < height && nc >= 0 && nc < width && !inMaze[nr][nc]) {
          frontier.push({ row: nr, col: nc, fromRow: r, fromCol: c });
        }
      }
    };

    // Seed the maze with the top-left cell
    inMaze[0][0] = true;
    markCell(grid, 0, 0);
    addFrontier(0, 0);

    while (frontier.length > 0) {
      // Pick a random frontier entry using swap-and-pop (O(1) removal)
      const idx = Math.floor(random() * frontier.length);
      const entry = frontier[idx] as FrontierEntry;
      frontier[idx] = frontier[frontier.length - 1] as FrontierEntry;
      frontier.pop();

      const { row, col, fromRow, fromCol } = entry;

      // A cell may appear in the frontier multiple times; skip duplicates
      if (inMaze[row][col]) {
        continue;
      }

      inMaze[row][col] = true;
      carvePassage(grid, fromRow, fromCol, row, col);
      addFrontier(row, col);
    }

    return grid;
  }
}
