/**
 * Eller's Algorithm maze generator.
 *
 * Generates a perfect maze row by row, maintaining set membership for each
 * cell in the current row. Horizontally merges adjacent cells of different
 * sets (with ~50% probability per pair), then for each resulting set carves
 * at least one downward passage before advancing to the next row. The last
 * row forces all adjacent cells of different sets to merge, guaranteeing
 * full connectivity with no isolated sections.
 *
 * Time complexity:  O(W × H) — processes each cell a constant number of times.
 * Space complexity: O(W)     — only the current row's set assignments are kept.
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, markCell, carvePassage } from '../utils/grid';
import { createRandom } from '../utils/random';

/**
 * Eller's maze generator implementing the Strategy pattern via IMazeGenerator.
 */
export class EllersGenerator implements IMazeGenerator {
  /**
   * Generates a perfect maze using Eller's algorithm.
   *
   * @param config - Validated maze configuration.
   * @returns MazeMatrix where 0 = wall, 1 = passage.
   */
  generate(config: MazeConfig): MazeMatrix {
    const { width, height, seed } = config;
    const random = createRandom(seed);
    const grid = createGrid(width, height);

    // rowSets[c] = set ID for the cell at column c in the current row.
    // Set IDs start at 1; 0 is the sentinel for "unassigned".
    let rowSets: number[] = new Array<number>(width).fill(0);
    let nextSetId = 1;

    // Initialise the first row: every cell gets its own unique set.
    for (let c = 0; c < width; c++) {
      rowSets[c] = nextSetId++;
      markCell(grid, 0, c);
    }

    for (let r = 0; r < height; r++) {
      const isLastRow = r === height - 1;

      // --- Horizontal merging ---
      // Merge adjacent cells that belong to different sets with ~50% probability.
      // On the last row always merge different-set neighbours to ensure the maze
      // is fully connected (no isolated section can remain).
      for (let c = 0; c < width - 1; c++) {
        const leftSet = rowSets[c];
        const rightSet = rowSets[c + 1];
        if (leftSet !== rightSet && (isLastRow || random() < 0.5)) {
          // Absorb rightSet into leftSet across the entire current row.
          for (let k = 0; k < width; k++) {
            if (rowSets[k] === rightSet) rowSets[k] = leftSet;
          }
          carvePassage(grid, r, c, r, c + 1);
        }
      }

      // Nothing more to do on the final row.
      if (isLastRow) break;

      // --- Vertical connections ---
      // Group current-row columns by their set, then for each set randomly
      // select ≥ 1 cells to connect downward, preserving the set into the
      // next row. Cells not chosen downward start fresh sets in the next row.
      const setColumns = new Map<number, number[]>();
      for (let c = 0; c < width; c++) {
        let cols = setColumns.get(rowSets[c]);
        if (cols === undefined) {
          cols = [];
          setColumns.set(rowSets[c], cols);
        }
        cols.push(c);
      }

      const nextRowSets: number[] = new Array<number>(width).fill(0);

      for (const [setId, cols] of setColumns) {
        // Shuffle the column list in-place (Fisher-Yates) to avoid a
        // systematic left-biased preference when picking connections.
        for (let i = cols.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));
          const tmp = cols[i];
          cols[i] = cols[j] as number;
          cols[j] = tmp;
        }

        let connected = 0;
        for (const c of cols) {
          // Guarantee at least one downward connection per set; accept
          // subsequent ones with ~50% probability.
          if (connected === 0 || random() < 0.5) {
            carvePassage(grid, r, c, r + 1, c);
            nextRowSets[c] = setId; // carry the set ID into the next row
            connected++;
          }
        }
      }

      // Cells in the next row that received no downward connection begin a
      // brand-new set; mark them open so they are accessible.
      for (let c = 0; c < width; c++) {
        if (nextRowSets[c] === 0) {
          nextRowSets[c] = nextSetId++;
          markCell(grid, r + 1, c);
        }
      }

      rowSets = nextRowSets;
    }

    return grid;
  }
}
