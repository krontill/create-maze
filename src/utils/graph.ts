/**
 * Conversion utility: MazeMatrix → MazeGraph (adjacency list).
 *
 * Time complexity:  O(W × H)
 * Space complexity: O(W × H)
 */

import type { MazeGraph, MazeMatrix, GraphNode } from '../types';

/** The four cardinal directions as [rowDelta, colDelta] pairs. */
const DIRECTIONS: [number, number][] = [
  [-1, 0], // up
  [1, 0],  // down
  [0, -1], // left
  [0, 1],  // right
];

/**
 * Converts a MazeMatrix to a MazeGraph adjacency list.
 *
 * Each cell (r, c) becomes a GraphNode with id = r × width + c.
 * An edge exists between two nodes when the wall between their
 * corresponding grid positions is a passage (value 1).
 *
 * @param matrix - The maze matrix (0 = wall, 1 = passage).
 * @param width  - Number of cells wide.
 * @param height - Number of cells tall.
 * @returns An array of GraphNodes ordered row-major.
 */
export function matrixToGraph(
  matrix: MazeMatrix,
  width: number,
  height: number,
): MazeGraph {
  const nodes: MazeGraph = [];

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const neighbors: number[] = [];

      for (const [dr, dc] of DIRECTIONS) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
          // Wall between (r,c) and (nr,nc) is at (r+nr+1, c+nc+1)
          const wallRow = r + nr + 1;
          const wallCol = c + nc + 1;
          if (matrix[wallRow][wallCol] === 1) {
            neighbors.push(nr * width + nc);
          }
        }
      }

      const node: GraphNode = {
        id: r * width + c,
        x: c,
        y: r,
        neighbors,
      };

      nodes.push(node);
    }
  }

  return nodes;
}
