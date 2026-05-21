/**
 * Binary Tree maze generator.
 *
 * Processes every cell once (row-major order). For each cell, randomly carves
 * a passage either north (row - 1) or east (col + 1). When only one direction
 * is in-bounds that direction is chosen deterministically; the top-right corner
 * cell has no valid neighbour and is left as a marked dead-end (the entry and
 * exit openings added by createGrid provide connectivity for 1-cell edge cases).
 *
 * Time complexity:  O(W × H) — exactly one decision per cell.
 * Space complexity: O(1) — no auxiliary data structures beyond the grid itself.
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, markCell, carvePassage } from '../utils/grid';
import { createRandom } from '../utils/random';

/**
 * Binary Tree maze generator implementing the Strategy pattern via IMazeGenerator.
 */
export class BinaryTreeGenerator implements IMazeGenerator {
  /**
   * Generates a perfect maze using the Binary Tree algorithm.
   *
   * @param config - Validated maze configuration.
   * @returns MazeMatrix where 0 = wall, 1 = passage.
   */
  generate(config: MazeConfig): MazeMatrix {
    const { width, height, seed } = config;
    const random = createRandom(seed);
    const grid = createGrid(width, height);

    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        markCell(grid, r, c);

        const canNorth = r > 0;
        const canEast = c < width - 1;

        if (canNorth && canEast) {
          // Randomly choose north or east
          if (random() < 0.5) {
            carvePassage(grid, r, c, r - 1, c);
          } else {
            carvePassage(grid, r, c, r, c + 1);
          }
        } else if (canNorth) {
          carvePassage(grid, r, c, r - 1, c);
        } else if (canEast) {
          carvePassage(grid, r, c, r, c + 1);
        }
        // Top-right corner: no valid neighbour — cell is already marked.
      }
    }

    return grid;
  }
}
