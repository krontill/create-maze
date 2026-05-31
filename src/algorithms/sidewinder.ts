/**
 * Sidewinder maze generator.
 *
 * Processes the grid row by row, left to right. Each cell is added to the
 * current "run". At each step, either a passage is carved east (extending the
 * run) or the run is closed by carving north from a randomly chosen run member.
 * The top row is always carved fully east because there is no row above it.
 *
 * Time complexity:  O(W × H) — each cell is visited exactly once.
 * Space complexity: O(W) — only the current run is stored (at most W cells).
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, markCell, carvePassage, deepCopyMatrix } from '../utils/grid';
import { createRandom } from '../utils/random';

/**
 * Sidewinder maze generator implementing the Strategy pattern via IMazeGenerator.
 */
export class SidewinderGenerator implements IMazeGenerator {
  private _run(
    config: MazeConfig,
    onStep?: (grid: MazeMatrix) => void,
  ): MazeMatrix {
    const { width, height, seed } = config;
    const random = createRandom(seed);
    const grid = createGrid(width, height);

    for (let r = 0; r < height; r++) {
      // Tracks columns in the current horizontal run
      const run: number[] = [];

      for (let c = 0; c < width; c++) {
        markCell(grid, r, c);
        run.push(c);

        const atEasternBoundary = c === width - 1;
        const atNorthernBoundary = r === 0;

        // Close the run when forced (eastern edge) or randomly chosen.
        // The top row is never closed early — it is always carved east.
        const shouldCloseRun =
          atEasternBoundary || (!atNorthernBoundary && random() < 0.5);

        if (shouldCloseRun) {
          if (!atNorthernBoundary) {
            // Pick a random member of the run and carve north from it
            const memberIndex = Math.floor(random() * run.length);
            const member = run[memberIndex];
            if (member !== undefined) {
              carvePassage(grid, r, member, r - 1, member);
              onStep?.(grid);
            }
          }
          run.length = 0;
        } else {
          // Extend the run eastward
          carvePassage(grid, r, c, r, c + 1);
          onStep?.(grid);
        }
      }
    }

    return grid;
  }

  /**
   * Generates a perfect maze using the Sidewinder algorithm.
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
