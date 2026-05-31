/**
 * Wilson's algorithm maze generator (Loop-Erased Random Walk).
 *
 * Produces a uniformly random spanning tree: every perfect maze of a given
 * size is equally likely. The algorithm performs random walks from unvisited
 * cells, erasing loops on the fly, until each walk connects to the growing
 * maze.
 *
 * Time complexity:  O(W × H · log(W × H)) expected — total walk length is
 *                   bounded by the random-walk cover time of the grid graph.
 * Space complexity: O(W × H) — in-maze flags, walk-direction array, and
 *                   visited-cell list.
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, markCell, carvePassage, deepCopyMatrix } from '../utils/grid';
import { createRandom } from '../utils/random';

/** Cardinal directions as [rowDelta, colDelta] pairs. */
const DIRECTIONS: readonly [number, number][] = [
  [-1, 0], // up
  [1, 0],  // down
  [0, -1], // left
  [0, 1],  // right
];

/**
 * Wilson's algorithm maze generator implementing the Strategy pattern
 * via IMazeGenerator.
 */
export class WilsonsGenerator implements IMazeGenerator {
  /**
   * Generates a perfect, uniformly random maze using Wilson's algorithm.
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

  private _run(
    config: MazeConfig,
    onStep?: (grid: MazeMatrix) => void,
  ): MazeMatrix {
    const { width, height, seed } = config;
    const random = createRandom(seed);
    const grid = createGrid(width, height);
    const totalCells = width * height;

    // Tracks which cells have been incorporated into the maze.
    const inMaze: boolean[][] = Array.from(
      { length: height },
      () => new Array<boolean>(width).fill(false),
    );

    // walkDir[r][c] stores the direction index (0–3) used to leave cell (r, c)
    // during the current random walk, or -1 when the cell is not yet in the walk.
    // Overwriting on a revisit erases the loop — the core LERW property.
    const walkDir: number[][] = Array.from(
      { length: height },
      () => new Array<number>(width).fill(-1),
    );

    // Cells touched in the current walk; used to reset walkDir between walks.
    const walkVisited: [number, number][] = [];

    // Seed the maze with the top-left cell.
    inMaze[0][0] = true;
    markCell(grid, 0, 0);
    let inMazeCount = 1;

    // Advance a cursor in row-major order to find the next unvisited cell
    // in O(1) amortised time (the cursor never moves backwards).
    let nextCellIdx = 1;

    while (inMazeCount < totalCells) {
      // Skip cells already absorbed into the maze.
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
      // Walk until we reach a cell already in the maze.
      let curRow = startRow;
      let curCol = startCol;

      while (!inMaze[curRow][curCol]) {
        // Register first visit for later cleanup.
        if (walkDir[curRow][curCol] === -1) {
          walkVisited.push([curRow, curCol]);
          // Set a placeholder so we do not push this cell again on OOB retries.
          walkDir[curRow][curCol] = 0;
        }

        const dirIdx = Math.floor(random() * DIRECTIONS.length);
        const dir = DIRECTIONS[dirIdx];
        // DIRECTIONS always has exactly 4 elements; this check satisfies TS strict access.
        if (dir === undefined) continue;

        const [dr, dc] = dir;
        const nextRow = curRow + dr;
        const nextCol = curCol + dc;

        // Reject out-of-bounds moves without advancing.
        if (nextRow < 0 || nextRow >= height || nextCol < 0 || nextCol >= width) {
          continue;
        }

        // Record direction leaving curRow, curCol (overwrites on revisit = loop erasure).
        walkDir[curRow][curCol] = dirIdx;
        curRow = nextRow;
        curCol = nextCol;
      }

      // --- Trace the loop-erased path and carve it into the maze ---
      // The start cell needs explicit grid marking because carvePassage only
      // opens the destination cell, not the source.
      markCell(grid, startRow, startCol);

      let traceRow = startRow;
      let traceCol = startCol;

      while (true) {
        inMaze[traceRow][traceCol] = true;
        inMazeCount++;

        const dirIdx = walkDir[traceRow][traceCol];
        const dir = DIRECTIONS[dirIdx];
        if (dir === undefined) break; // walk direction was never set — unreachable

        const [dr, dc] = dir;
        const nextRow = traceRow + dr;
        const nextCol = traceCol + dc;

        carvePassage(grid, traceRow, traceCol, nextRow, nextCol);

        // Stop once we have connected to the existing maze.
        if (inMaze[nextRow][nextCol]) break;

        traceRow = nextRow;
        traceCol = nextCol;
      }
      onStep?.(grid);
    }

    return grid;
  }
}
