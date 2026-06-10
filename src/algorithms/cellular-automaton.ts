/**
 * Cellular Automaton maze generator.
 *
 * Grows organic, cave-like passages by seeding a random alive/dead grid and
 * iterating a configurable Moore-neighbourhood cellular automaton rule for a
 * fixed number of
 * generations. Dead cells with ≥ 5 alive neighbours are born; alive cells
 * with ≥ 4 alive neighbours survive by default. Out-of-bounds neighbours count
 * as alive to reinforce cave borders. A Prim's-style random frontier expansion then
 * repairs connectivity, connecting any unreachable cell to its nearest
 * reachable neighbour via organic, branchy corridors.
 *
 * Time complexity:  O(G × W × H) — G = caGenerations (default 4).
 * Space complexity: O(W × H) — two alive grids (current/next) plus the
 *                              output matrix.
 */

import type {
  CellularAutomatonRule,
  IMazeGenerator,
  MazeConfig,
  MazeMatrix,
} from '../types';
import { createGrid, markCell, deepCopyMatrix } from '../utils/grid';
import { createRandom } from '../utils/random';

/** Default probability that a cell starts alive. Ideal for B5/S45 cave rules. */
const DEFAULT_FILL_RATIO = 0.45;

/** Default number of CA generations to apply before converting to a maze matrix. */
const DEFAULT_GENERATIONS = 4;

/** Default CA rule preset. */
const DEFAULT_RULE: CellularAutomatonRule = 'b5s45';

/** Cardinal directions for wall-opening and connectivity repair. */
const DIRECTIONS: [number, number][] = [
  [-1, 0], // up
  [1, 0],  // down
  [0, -1], // left
  [0, 1],  // right
];

/**
 * Count the Moore (8-cell) neighbours of (r, c) that are alive.
 * Cells outside grid bounds are treated as alive to reinforce border walls.
 *
 * Time complexity:  O(1) — iterates at most 8 fixed neighbours.
 * Space complexity: O(1)
 */
function countAliveNeighbours(
  alive: boolean[][],
  r: number,
  c: number,
  height: number,
  width: number,
): number {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= height || nc < 0 || nc >= width || alive[nr][nc]) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Apply one configured CA rule to a cell with `n` alive neighbors.
 *
 * Time complexity:  O(1)
 * Space complexity: O(1)
 */
function applyRule(
  rule: CellularAutomatonRule,
  isAlive: boolean,
  aliveNeighbours: number,
): boolean {
  if (rule === 'maze') {
    return isAlive
      ? aliveNeighbours >= 1 && aliveNeighbours <= 5
      : aliveNeighbours === 3;
  }

  if (rule === 'mazectric') {
    return isAlive
      ? aliveNeighbours >= 1 && aliveNeighbours <= 4
      : aliveNeighbours === 3;
  }

  return isAlive ? aliveNeighbours >= 4 : aliveNeighbours >= 5;
}

/**
 * Convert an alive[][] boolean grid to a MazeMatrix by marking alive cells as
 * passages and opening the wall between every pair of orthogonally adjacent
 * alive cells.
 *
 * Time complexity:  O(W × H)
 * Space complexity: O(W × H)
 */
function aliveToMatrix(
  alive: boolean[][],
  width: number,
  height: number,
): MazeMatrix {
  const grid = createGrid(width, height);
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (!alive[r][c]) continue;
      markCell(grid, r, c);
      for (const [dr, dc] of DIRECTIONS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < height && nc >= 0 && nc < width && alive[nr][nc]) {
          // Wall between (r, c) and (nr, nc) sits at grid position
          // (r + nr + 1, c + nc + 1) — the midpoint of their grid coords.
          grid[r + nr + 1][c + nc + 1] = 1;
        }
      }
    }
  }
  return grid;
}

/**
 * Ensure every W×H cell is reachable from (0, 0) — satisfying the same
 * connectivity contract as {@link isFullyConnected} in the test helpers.
 *
 * Phase 1: BFS through already-open walls to find all currently reachable
 *   cells.
 * Phase 2: Prim's-style random frontier expansion. The frontier is seeded
 *   with every reachable cell that has at least one unreachable neighbour.
 *   At each step a random frontier cell is chosen, one of its random
 *   unreachable neighbours is carved in, and the new cell is added to the
 *   frontier. Using random selection (rather than FIFO/BFS) produces a
 *   spanning tree over the disconnected region that looks like an organic
 *   maze — branchy and irregular — instead of a straight grid flood-fill.
 *
 * Time complexity:  O(W × H) — each cell enters and leaves the frontier at
 *                   most once.
 * Space complexity: O(W × H) for the visited and inFrontier grids.
 */
function repairConnectivity(
  grid: MazeMatrix,
  width: number,
  height: number,
  random: () => number,
): void {
  // Phase 1: BFS through open walls (mirrors isFullyConnected logic).
  const visited: boolean[][] = Array.from(
    { length: height },
    () => new Array<boolean>(width).fill(false),
  );
  const bfsQueue: [number, number][] = [[0, 0]];
  visited[0][0] = true;

  let qi = 0;
  while (qi < bfsQueue.length) {
    const cell = bfsQueue[qi++];
    if (cell === undefined) break;
    const [r, c] = cell;
    for (const [dr, dc] of DIRECTIONS) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr >= 0 && nr < height &&
        nc >= 0 && nc < width &&
        !visited[nr][nc] &&
        grid[r + nr + 1][c + nc + 1] === 1
      ) {
        visited[nr][nc] = true;
        bfsQueue.push([nr, nc]);
      }
    }
  }

  // Phase 2: Prim's-style random frontier expansion.
  const inFrontier: boolean[][] = Array.from(
    { length: height },
    () => new Array<boolean>(width).fill(false),
  );
  const frontier: [number, number][] = [];

  const addToFrontier = (r: number, c: number): void => {
    if (inFrontier[r][c]) return;
    for (const [dr, dc] of DIRECTIONS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < height && nc >= 0 && nc < width && !visited[nr][nc]) {
        inFrontier[r][c] = true;
        frontier.push([r, c]);
        return;
      }
    }
  };

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (visited[r][c]) addToFrontier(r, c);
    }
  }

  while (frontier.length > 0) {
    // Pick a random frontier cell; use swap-remove for O(1) deletion.
    const idx = Math.floor(random() * frontier.length);
    const [r, c] = frontier[idx];

    // Collect unreachable neighbours.
    const candidates: [number, number][] = [];
    for (const [dr, dc] of DIRECTIONS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < height && nc >= 0 && nc < width && !visited[nr][nc]) {
        candidates.push([nr, nc]);
      }
    }

    if (candidates.length === 0) {
      // No unvisited neighbours left — retire this frontier cell.
      frontier[idx] = frontier[frontier.length - 1];
      frontier.pop();
      continue;
    }

    // Carve a passage to one random unreachable neighbour.
    const [nr, nc] = candidates[Math.floor(random() * candidates.length)];
    grid[r + nr + 1][c + nc + 1] = 1;
    markCell(grid, nr, nc);
    visited[nr][nc] = true;
    addToFrontier(nr, nc);
    // Keep (r, c) in the frontier — it may still connect more neighbours.
  }
}

/**
 * Cellular Automaton maze generator implementing the Strategy pattern via
 * {@link IMazeGenerator}.
 */
export class CellularAutomatonGenerator implements IMazeGenerator {
  /**
   * Core generation routine shared by `generate()` and `steps()`.
   *
   * @param config  - Validated maze configuration.
   * @param onStep  - Optional snapshot callback, invoked after each CA
   *                  generation with an intermediate MazeMatrix, and once
   *                  more after the final connectivity repair.
   */
  private _run(
    config: MazeConfig,
    onStep?: (snapshot: MazeMatrix) => void,
  ): MazeMatrix {
    const { width, height, seed } = config;
    const fillRatio = config.caFillRatio ?? DEFAULT_FILL_RATIO;
    const generations = config.caGenerations ?? DEFAULT_GENERATIONS;
    const rule = config.caRule ?? DEFAULT_RULE;
    const random = createRandom(seed);

    // Phase 1: Seed the alive grid at fillRatio density.
    let alive: boolean[][] = Array.from(
      { length: height },
      () => Array.from({ length: width }, () => random() < fillRatio),
    );
    alive[0][0] = true; // Anchor the entry cell.

    // Phase 2: Apply the configured Moore-neighbourhood rule.
    for (let gen = 0; gen < generations; gen++) {
      const next: boolean[][] = Array.from(
        { length: height },
        () => new Array<boolean>(width).fill(false),
      );

      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          const n = countAliveNeighbours(alive, r, c, height, width);
          next[r][c] = applyRule(rule, alive[r][c], n);
        }
      }

      alive = next;
      alive[0][0] = true; // Re-anchor after each generation.

      if (onStep) {
        onStep(aliveToMatrix(alive, width, height));
      }
    }

    // Phase 3: Convert the final alive state to the output matrix.
    const grid = aliveToMatrix(alive, width, height);

    // Phase 4: Repair connectivity so all W×H cells are reachable from (0,0).
    repairConnectivity(grid, width, height, random);

    onStep?.(grid);

    return grid;
  }

  /**
   * Generates a cave-like maze using the Cellular Automaton algorithm.
   *
   * @param config - Validated maze configuration.
   * @returns MazeMatrix where 0 = wall, 1 = passage.
   */
  generate(config: MazeConfig): MazeMatrix {
    return this._run(config);
  }

  steps(config: MazeConfig): MazeMatrix[] {
    const snapshots: MazeMatrix[] = [];
    this._run(config, (snapshot) => snapshots.push(deepCopyMatrix(snapshot)));
    return snapshots;
  }
}
