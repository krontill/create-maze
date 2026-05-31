/**
 * Recursive Division maze generator.
 *
 * Starts from a fully open grid (all cells and internal passages are
 * passages) and recursively bisects chambers with walls, leaving exactly
 * one random passage in each wall. Unlike carving algorithms, this one
 * adds walls rather than removing them, producing mazes with long straight
 * corridors and clearly visible rectangular regions.
 *
 * Time complexity:  O(W × H) — every internal wall cell is closed at most
 *                  once across the entire recursion tree.
 * Space complexity: O(W × H) for the grid; O(W + H) for the call stack in
 *                  the worst case (pathological unbalanced splits). For
 *                  typical mazes the stack depth is O(log(W × H)).
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, markCell, carvePassage, deepCopyMatrix } from '../utils/grid';
import { createRandom } from '../utils/random';

/**
 * Returns a random integer in the closed interval [min, max].
 *
 * @param min    - Inclusive lower bound.
 * @param max    - Inclusive upper bound (must be ≥ min).
 * @param random - PRNG that returns a value in [0, 1).
 */
function randomInt(min: number, max: number, random: () => number): number {
  return min + Math.floor(random() * (max - min + 1));
}

/**
 * Opens every cell and every internal passage so the grid starts as a
 * completely open field before walls are added by the division step.
 *
 * Time complexity:  O(W × H)
 * Space complexity: O(1) extra (mutates the grid in place)
 */
function openAll(grid: MazeMatrix, width: number, height: number): void {
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      markCell(grid, r, c);
      if (r + 1 < height) carvePassage(grid, r, c, r + 1, c);
      if (c + 1 < width) carvePassage(grid, r, c, r, c + 1);
    }
  }
}

/**
 * Recursively bisects the chamber defined by cell coordinates
 * (r1, c1) – (r2, c2) inclusive, closing all but one passage in the
 * dividing wall.
 *
 * @param grid   - The maze matrix to mutate.
 * @param r1     - Top cell row of the chamber.
 * @param c1     - Left cell column of the chamber.
 * @param r2     - Bottom cell row of the chamber.
 * @param c2     - Right cell column of the chamber.
 * @param random - Seeded PRNG.
 */
function divide(
  grid: MazeMatrix,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  random: () => number,
  onStep?: (grid: MazeMatrix) => void,
): void {
  const chamberWidth = c2 - c1 + 1;
  const chamberHeight = r2 - r1 + 1;

  // A chamber of 1 cell in both dimensions cannot be divided further.
  if (chamberWidth <= 1 && chamberHeight <= 1) return;

  // Decide orientation: prefer splitting the longer axis so divisions
  // stay balanced. Fall back to a coin flip when both axes are equal
  // and both allow splitting.
  let horizontal: boolean;
  if (chamberHeight <= 1) {
    horizontal = false; // too short to split horizontally
  } else if (chamberWidth <= 1) {
    horizontal = true; // too narrow to split vertically
  } else {
    horizontal = chamberHeight >= chamberWidth
      ? random() < 0.5 || chamberHeight > chamberWidth
      : false;
    // Simpler expression: bias toward the longer axis.
    horizontal = chamberHeight > chamberWidth
      ? true
      : chamberWidth > chamberHeight
        ? false
        : random() < 0.5;
  }

  if (horizontal) {
    // Draw a horizontal wall between cell row `wr` and `wr + 1`.
    // The wall sits at grid row 2*wr+2; valid range: [r1, r2-1].
    const wr = randomInt(r1, r2 - 1, random);
    // Pick the single gap column (in cell coordinates).
    const passageCol = randomInt(c1, c2, random);

    for (let c = c1; c <= c2; c++) {
      if (c !== passageCol) {
        // Close the passage that was opened between (wr, c) and (wr+1, c).
        // Wall grid position: (wr + (wr+1) + 1, c + c + 1) = (2*wr+2, 2*c+1)
        grid[2 * wr + 2][2 * c + 1] = 0;
      }
    }
    onStep?.(grid);

    divide(grid, r1, c1, wr, c2, random, onStep);
    divide(grid, wr + 1, c1, r2, c2, random, onStep);
  } else {
    // Draw a vertical wall between cell col `wc` and `wc + 1`.
    // The wall sits at grid col 2*wc+2; valid range: [c1, c2-1].
    const wc = randomInt(c1, c2 - 1, random);
    // Pick the single gap row (in cell coordinates).
    const passageRow = randomInt(r1, r2, random);

    for (let r = r1; r <= r2; r++) {
      if (r !== passageRow) {
        // Close the passage that was opened between (r, wc) and (r, wc+1).
        // Wall grid position: (r + r + 1, wc + (wc+1) + 1) = (2*r+1, 2*wc+2)
        grid[2 * r + 1][2 * wc + 2] = 0;
      }
    }
    onStep?.(grid);

    divide(grid, r1, c1, r2, wc, random, onStep);
    divide(grid, r1, wc + 1, r2, c2, random, onStep);
  }
}

/** Recursive Division maze generator implementing the Strategy pattern. */
export class RecursiveDivisionGenerator implements IMazeGenerator {
  /**
   * Generates a perfect maze using recursive division.
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

    // Open the entire interior before adding dividing walls.
    openAll(grid, width, height);

    // Recursively divide the full chamber.
    divide(grid, 0, 0, height - 1, width - 1, random, onStep);

    return grid;
  }
}
