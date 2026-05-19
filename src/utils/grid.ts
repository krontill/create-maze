/**
 * Grid allocation and passage-carving utilities.
 *
 * A maze with `width` × `height` cells is represented as a
 * (2H + 1) × (2W + 1) numeric matrix where:
 *   - 0 = wall
 *   - 1 = passage
 *
 * Cell (r, c) occupies grid position (2r + 1, 2c + 1).
 * The wall between adjacent cells (r1,c1) and (r2,c2) is at
 * grid position (r1 + r2 + 1, c1 + c2 + 1).
 */

import type { MazeMatrix } from '../types';

/**
 * Allocates a (2H + 1) × (2W + 1) grid, all zeros (walls).
 * Pre-opens an entry on the left border of the top-left cell and
 * an exit on the right border of the bottom-right cell.
 *
 * Time complexity:  O(W × H)
 * Space complexity: O(W × H)
 *
 * @param width  - Number of cells wide (≥ 1).
 * @param height - Number of cells tall (≥ 1).
 */
export function createGrid(width: number, height: number): MazeMatrix {
  const rows = 2 * height + 1;
  const cols = 2 * width + 1;
  const grid: MazeMatrix = Array.from(
    { length: rows },
    () => new Array<number>(cols).fill(0),
  );

  // Entry: left border of the top-left cell → grid[1][0]
  grid[1][0] = 1;
  // Exit: right border of the bottom-right cell → grid[2H-1][2W]
  grid[2 * height - 1][2 * width] = 1;

  return grid;
}

/**
 * Marks a cell as a passage (sets its grid position to 1).
 *
 * Time complexity:  O(1)
 * Space complexity: O(1)
 *
 * @param grid - The maze matrix to mutate.
 * @param row  - Cell row (maze-cell coordinate, 0-based).
 * @param col  - Cell column (maze-cell coordinate, 0-based).
 */
export function markCell(grid: MazeMatrix, row: number, col: number): void {
  grid[2 * row + 1][2 * col + 1] = 1;
}

/**
 * Carves a passage from cell (fromRow, fromCol) to the adjacent cell
 * (toRow, toCol) by opening the wall between them and marking the
 * destination cell as a passage.
 *
 * Both arguments are in maze-cell coordinates (not grid coordinates).
 * The two cells must be orthogonally adjacent.
 *
 * Time complexity:  O(1)
 * Space complexity: O(1)
 *
 * @param grid    - The maze matrix to mutate.
 * @param fromRow - Source cell row.
 * @param fromCol - Source cell column.
 * @param toRow   - Destination cell row.
 * @param toCol   - Destination cell column.
 */
export function carvePassage(
  grid: MazeMatrix,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): void {
  // Wall sits at the midpoint of the two grid positions:
  //   midRow = (2*fromRow+1 + 2*toRow+1) / 2 = fromRow + toRow + 1
  const wallRow = fromRow + toRow + 1;
  const wallCol = fromCol + toCol + 1;
  grid[wallRow][wallCol] = 1;
  grid[2 * toRow + 1][2 * toCol + 1] = 1;
}
