/**
 * Hunt-and-Kill maze generator.
 *
 * Alternates between two phases to carve a perfect maze (spanning tree):
 *
 * **Kill phase** — from the current cell, choose a random unvisited neighbour,
 * carve a passage into it, and move there. Repeat until the current cell has
 * no unvisited neighbours (the walker is "stuck").
 *
 * **Hunt phase** — scan the grid row by row to find the first unvisited cell
 * that is adjacent to at least one visited cell. Carve a passage between that
 * unvisited cell and one of its visited neighbours, then restart the kill
 * phase from the newly connected cell.
 *
 * The algorithm terminates when the hunt phase finds no such cell, meaning
 * every cell has been visited.
 *
 * Time complexity:  O((W × H)²) worst case — the hunt phase may scan the
 *                   entire grid for each kill-phase dead end. In practice the
 *                   average is much closer to O(W × H × log(W × H)).
 * Space complexity: O(W × H) — for the visited tracking array.
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, carvePassage, markCell, deepCopyMatrix } from '../utils/grid';
import { createRandom, shuffle } from '../utils/random';

/** Cardinal directions as [rowDelta, colDelta] pairs. */
const DIRECTIONS: [number, number][] = [
  [-1, 0], // up
  [1, 0],  // down
  [0, -1], // left
  [0, 1],  // right
];

/**
 * Hunt-and-Kill maze generator implementing the Strategy pattern via
 * IMazeGenerator.
 */
export class HuntAndKillGenerator implements IMazeGenerator {
  /**
   * Generates a perfect maze using the Hunt-and-Kill algorithm.
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

    // Track which cells have been incorporated into the maze
    const visited: boolean[][] = Array.from(
      { length: height },
      () => new Array<boolean>(width).fill(false),
    );

    // Start from a random cell
    let row = Math.floor(random() * height);
    let col = Math.floor(random() * width);
    visited[row][col] = true;
    markCell(grid, row, col);

    // Outer loop: each iteration is one kill phase followed by one hunt phase.
    // Terminates when the hunt phase finds no unvisited cell to connect.
    while (true) {
      // ── Kill phase ──────────────────────────────────────────────────────
      // Walk randomly into unvisited neighbours until stuck.
      let moved = true;
      while (moved) {
        const dirs: [number, number][] = [...DIRECTIONS];
        shuffle(dirs, random);

        moved = false;
        for (const [dr, dc] of dirs) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < height && nc >= 0 && nc < width && !visited[nr][nc]) {
            carvePassage(grid, row, col, nr, nc);
            visited[nr][nc] = true;
            row = nr;
            col = nc;
            onStep?.(grid);
            moved = true;
            break;
          }
        }
      }

      // ── Hunt phase ──────────────────────────────────────────────────────
      // Scan row-by-row for an unvisited cell adjacent to a visited cell.
      let found = false;
      outer: for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          if (visited[r][c]) continue;

          // Gather visited neighbours of (r, c)
          const visitedNeighbours: [number, number][] = [];
          for (const [dr, dc] of DIRECTIONS) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < height && nc >= 0 && nc < width && visited[nr][nc]) {
              visitedNeighbours.push([nr, nc]);
            }
          }

          if (visitedNeighbours.length === 0) continue;

          // Pick one visited neighbour at random and carve toward it.
          // Pass the visited neighbour as "from" so the new cell (r,c) is the
          // destination — carvePassage marks only the destination cell body.
          const idx = Math.floor(random() * visitedNeighbours.length);
          // Non-null assertion is safe: length > 0 is guaranteed above
          const [vr, vc] = visitedNeighbours[idx]!;

          carvePassage(grid, vr, vc, r, c);
          visited[r][c] = true;
          row = r;
          col = c;
          onStep?.(grid);
          found = true;
          break outer;
        }
      }

      if (!found) {
        // No unvisited cell with a visited neighbour — maze is complete
        break;
      }
    }

    return grid;
  }
}
