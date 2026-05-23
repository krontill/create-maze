/**
 * Houston's algorithm maze generator.
 *
 * Designed by Jamis Buck. Combines Aldous-Broder (Phase 1) and Wilson's
 * loop-erased random walk (Phase 2) to balance speed and uniform spanning
 * tree output.
 *
 * Phase 1 — Aldous-Broder:
 *   Perform a random walk and carve passages to every newly encountered cell.
 *   Stop once a quota of cells (default: 40 % of the grid) have been visited.
 *   Aldous-Broder is fast during this phase because empty cells are frequent.
 *
 * Phase 2 — Wilson's (LERW):
 *   Treat the Aldous-Broder result as the initial in-maze set.  From each
 *   remaining unvisited cell, perform a loop-erased random walk until the
 *   walk hits the maze, then carve the walk into the maze.  Wilson's excels
 *   at high fill-fractions because long fruitless walks are unlikely.
 *
 * Together the two phases are both fast *and* produce a uniformly random
 * spanning tree (identical output distribution to pure Wilson's).
 *
 * Time complexity:  O(W × H × log(W × H)) expected — governed by the cover
 *                   time of an unbiased random walk on the grid graph.
 * Space complexity: O(W × H) — visited flags, walk-direction array.
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, markCell, carvePassage } from '../utils/grid';
import { createRandom } from '../utils/random';

/** Cardinal directions as [rowDelta, colDelta] pairs. */
const DIRECTIONS: readonly [number, number][] = [
  [-1, 0], // up
  [1, 0],  // down
  [0, -1], // left
  [0, 1],  // right
];

/**
 * Fraction of cells to seed with Aldous-Broder before switching to Wilson's.
 * 0.4 (40 %) is the value recommended by Jamis Buck.
 */
const PHASE1_QUOTA = 0.4;

/**
 * Houston's algorithm maze generator implementing the Strategy pattern via
 * IMazeGenerator.
 */
export class HoustonsGenerator implements IMazeGenerator {
  /**
   * Generates a perfect maze using Houston's algorithm.
   *
   * @param config - Validated maze configuration.
   * @returns MazeMatrix where 0 = wall, 1 = passage.
   */
  generate(config: MazeConfig): MazeMatrix {
    const { width, height, seed } = config;
    const random = createRandom(seed);
    const grid = createGrid(width, height);

    const totalCells = width * height;
    const quota = Math.max(1, Math.floor(totalCells * PHASE1_QUOTA));

    // Tracks which cells are part of the maze.
    const inMaze: boolean[][] = Array.from(
      { length: height },
      () => new Array<boolean>(width).fill(false),
    );

    // -----------------------------------------------------------------------
    // Phase 1: Aldous-Broder — random walk until `quota` cells are visited.
    // -----------------------------------------------------------------------

    let row = Math.floor(random() * height);
    let col = Math.floor(random() * width);
    inMaze[row][col] = true;
    markCell(grid, row, col);
    let inMazeCount = 1;

    while (inMazeCount < quota) {
      const dirIdx = Math.floor(random() * DIRECTIONS.length);
      const dir = DIRECTIONS[dirIdx];
      if (dir === undefined) continue;

      const [dr, dc] = dir;
      const nextRow = row + dr;
      const nextCol = col + dc;

      if (nextRow < 0 || nextRow >= height || nextCol < 0 || nextCol >= width) {
        continue;
      }

      if (!inMaze[nextRow][nextCol]) {
        carvePassage(grid, row, col, nextRow, nextCol);
        inMaze[nextRow][nextCol] = true;
        inMazeCount++;
      }

      row = nextRow;
      col = nextCol;
    }

    if (inMazeCount >= totalCells) {
      return grid;
    }

    // -----------------------------------------------------------------------
    // Phase 2: Wilson's (loop-erased random walk) for remaining cells.
    // -----------------------------------------------------------------------

    // walkDir[r][c] — direction index (0–3) used to leave cell (r, c) during
    // the current walk, or -1 when the cell is not part of the active walk.
    // Overwriting on a revisit erases the loop (the core LERW property).
    const walkDir: number[][] = Array.from(
      { length: height },
      () => new Array<number>(width).fill(-1),
    );

    // Cells touched by the current walk; used to reset walkDir between walks.
    const walkVisited: [number, number][] = [];

    // Advance a cursor in row-major order to find the next unvisited cell
    // in O(1) amortised time (cursor never moves backwards).
    let nextCellIdx = 0;

    while (inMazeCount < totalCells) {
      // Advance cursor past cells already in the maze.
      while (
        nextCellIdx < totalCells &&
        inMaze[Math.floor(nextCellIdx / width)][nextCellIdx % width]
      ) {
        nextCellIdx++;
      }
      if (nextCellIdx >= totalCells) break;

      const startRow = Math.floor(nextCellIdx / width);
      const startCol = nextCellIdx % width;

      // Reset walk state from the previous iteration.
      for (const [r, c] of walkVisited) {
        walkDir[r][c] = -1;
      }
      walkVisited.length = 0;

      // --- Loop-erased random walk ---
      let curRow = startRow;
      let curCol = startCol;

      while (!inMaze[curRow][curCol]) {
        if (walkDir[curRow][curCol] === -1) {
          walkVisited.push([curRow, curCol]);
          walkDir[curRow][curCol] = 0; // placeholder to avoid double-push
        }

        const dirIdx = Math.floor(random() * DIRECTIONS.length);
        const dir = DIRECTIONS[dirIdx];
        if (dir === undefined) continue;

        const [dr, dc] = dir;
        const nextRow = curRow + dr;
        const nextCol = curCol + dc;

        if (nextRow < 0 || nextRow >= height || nextCol < 0 || nextCol >= width) {
          continue;
        }

        // Record direction leaving this cell (overwrites on revisit = loop erasure).
        walkDir[curRow][curCol] = dirIdx;
        curRow = nextRow;
        curCol = nextCol;
      }

      // --- Commit the walk path into the maze ---
      // The start cell must be explicitly opened because carvePassage only
      // marks the destination cell, not the source.
      markCell(grid, startRow, startCol);

      let commitRow = startRow;
      let commitCol = startCol;

      while (!inMaze[commitRow][commitCol]) {
        const dirIdx = walkDir[commitRow][commitCol];
        const dir = DIRECTIONS[dirIdx];
        if (dir === undefined) break;

        const [dr, dc] = dir;
        const nextRow = commitRow + dr;
        const nextCol = commitCol + dc;

        carvePassage(grid, commitRow, commitCol, nextRow, nextCol);
        inMaze[commitRow][commitCol] = true;
        inMazeCount++;

        commitRow = nextRow;
        commitCol = nextCol;
      }
    }

    return grid;
  }
}
