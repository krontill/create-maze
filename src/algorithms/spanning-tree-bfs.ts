/**
 * Spanning Tree (BFS) maze generator.
 *
 * Grows a spanning tree over the cell grid using a breadth-first frontier.
 * Each cell is dequeued and, if not yet visited, connected to the visited
 * parent cell that added it to the queue. Randomising the order in which
 * each newly connected cell enqueues its neighbours is what prevents a
 * deterministic, grid-aligned pattern.
 *
 * Compared with the DFS-based recursive backtracker, BFS produces mazes
 * with shorter, wider paths and a shallower spanning tree — many short dead
 * ends rather than a few long corridors.
 *
 * Time complexity:  O(W × H)
 * Space complexity: O(W × H)  (visited array + queue)
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, carvePassage, markCell } from '../utils/grid';
import { createRandom, shuffle } from '../utils/random';

const DIRECTIONS: [number, number][] = [
  [-1, 0], // up
  [1, 0],  // down
  [0, -1], // left
  [0, 1],  // right
];

/** A pending frontier entry: the cell to visit and the parent that enqueued it. */
type FrontierEntry = [row: number, col: number, parentRow: number, parentCol: number];

export class SpanningTreeBFSGenerator implements IMazeGenerator {
  generate(config: MazeConfig): MazeMatrix {
    const { width, height, seed } = config;
    const random = createRandom(seed);
    const grid = createGrid(width, height);

    const visited: boolean[][] = Array.from(
      { length: height },
      () => new Array<boolean>(width).fill(false),
    );

    // Start from the top-left cell.
    visited[0][0] = true;
    markCell(grid, 0, 0);

    const queue: FrontierEntry[] = [];
    this.enqueueNeighbours(queue, 0, 0, width, height, visited, random);

    while (queue.length > 0) {
      // Shift from the front to maintain BFS order.
      const entry = queue.shift();
      if (entry === undefined) break;
      const [row, col, parentRow, parentCol] = entry;

      // Skip if already connected (added to queue from multiple parents).
      if (visited[row][col]) continue;

      visited[row][col] = true;
      carvePassage(grid, parentRow, parentCol, row, col);

      this.enqueueNeighbours(queue, row, col, width, height, visited, random);
    }

    return grid;
  }

  /** Shuffles and enqueues all unvisited orthogonal neighbours of (row, col). */
  private enqueueNeighbours(
    queue: FrontierEntry[],
    row: number,
    col: number,
    width: number,
    height: number,
    visited: boolean[][],
    random: () => number,
  ): void {
    const dirs: [number, number][] = [...DIRECTIONS];
    shuffle(dirs, random);

    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < height && nc >= 0 && nc < width && !visited[nr][nc]) {
        queue.push([nr, nc, row, col]);
      }
    }
  }
}
