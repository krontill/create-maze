/**
 * Tremaux-inspired maze generator.
 *
 * Adapts Tremaux traversal marks for generation by tracking how many times
 * each carved edge is traversed. The algorithm carves only into unvisited
 * neighbours (preserving a perfect maze) and marks edges during forward and
 * backtracking traversals.
 *
 * Time complexity:  O(W × H) — each cell is carved once and each tree edge is
 *                   traversed at most twice.
 * Space complexity: O(W × H) — for visited tracking, traversal stack, and
 *                   edge-mark bookkeeping.
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, carvePassage, markCell, deepCopyMatrix } from '../utils/grid';
import { createRandom, shuffle } from '../utils/random';

/** Cardinal directions as [rowDelta, colDelta] pairs. */
const DIRECTIONS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

interface Cell {
  row: number;
  col: number;
}

function toEdgeKey(a: Cell, b: Cell): string {
  const aKey = `${a.row},${a.col}`;
  const bKey = `${b.row},${b.col}`;
  return aKey < bKey ? `${aKey}|${bKey}` : `${bKey}|${aKey}`;
}

export class TremauxGenerator implements IMazeGenerator {
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

    const visited: boolean[][] = Array.from(
      { length: height },
      () => new Array<boolean>(width).fill(false),
    );
    const edgeMarks = new Map<string, number>();
    const stack: Cell[] = [];

    const start: Cell = {
      row: Math.floor(random() * height),
      col: Math.floor(random() * width),
    };

    visited[start.row][start.col] = true;
    markCell(grid, start.row, start.col);
    stack.push(start);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      if (current === undefined) break;

      const unvisitedNeighbours: Cell[] = [];
      const dirs: [number, number][] = [...DIRECTIONS];
      shuffle(dirs, random);

      for (const [dr, dc] of dirs) {
        const nr = current.row + dr;
        const nc = current.col + dc;

        if (nr >= 0 && nr < height && nc >= 0 && nc < width && !visited[nr][nc]) {
          unvisitedNeighbours.push({ row: nr, col: nc });
        }
      }

      if (unvisitedNeighbours.length > 0) {
        let bestMark = Number.POSITIVE_INFINITY;
        let candidates: Cell[] = [];

        for (const neighbour of unvisitedNeighbours) {
          const edgeKey = toEdgeKey(current, neighbour);
          const markCount = edgeMarks.get(edgeKey) ?? 0;

          if (markCount < bestMark) {
            bestMark = markCount;
            candidates = [neighbour];
          } else if (markCount === bestMark) {
            candidates.push(neighbour);
          }
        }

        const next = candidates[Math.floor(random() * candidates.length)];
        if (next === undefined) {
          continue;
        }

        carvePassage(grid, current.row, current.col, next.row, next.col);
        visited[next.row][next.col] = true;

        const edgeKey = toEdgeKey(current, next);
        edgeMarks.set(edgeKey, (edgeMarks.get(edgeKey) ?? 0) + 1);
        onStep?.(grid);

        stack.push(next);
        continue;
      }

      if (stack.length > 1) {
        const previous = stack[stack.length - 2];
        if (previous !== undefined) {
          const edgeKey = toEdgeKey(current, previous);
          edgeMarks.set(edgeKey, (edgeMarks.get(edgeKey) ?? 0) + 1);
        }
      }

      stack.pop();
    }

    return grid;
  }
}
