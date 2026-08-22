import type { MazeMatrix } from '../src/index';

export interface CanvasPosition {
  row: number;
  col: number;
}

export function getNextCanvasPosition(
  matrix: MazeMatrix,
  row: number,
  col: number,
  deltaRow: number,
  deltaCol: number,
): CanvasPosition | null {
  const nextRow = row + deltaRow;
  const nextCol = col + deltaCol;
  return matrix[nextRow]?.[nextCol] === 1
    ? { row: nextRow, col: nextCol }
    : null;
}
