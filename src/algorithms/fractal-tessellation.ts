/**
 * Fractal Tessellation maze generator.
 *
 * Supports two deterministic modes:
 * - tile-substitution: DFS carving guided by a recursively generated motif map.
 * - quadtree-division: recursive 2x2 region subdivision that joins child trees.
 *
 * Time complexity:  O(W × H) in both modes.
 * Space complexity: O(W × H) for visitation/motif structures and recursion.
 */

import type { FractalMode, IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, carvePassage, markCell, deepCopyMatrix } from '../utils/grid';
import { createRandom, shuffle } from '../utils/random';

interface Cell {
  row: number;
  col: number;
}

interface Direction {
  id: number;
  dr: number;
  dc: number;
}

interface Region {
  r0: number;
  c0: number;
  r1: number;
  c1: number;
}

interface ConnectorEdge {
  a: number;
  b: number;
  carve: () => void;
}

const DIRECTIONS: Direction[] = [
  { id: 0, dr: -1, dc: 0 },
  { id: 1, dr: 0, dc: 1 },
  { id: 2, dr: 1, dc: 0 },
  { id: 3, dr: 0, dc: -1 },
];

const MOTIF_ORDERS: readonly (readonly number[])[] = [
  [0, 1, 2, 3],
  [1, 2, 3, 0],
  [2, 3, 0, 1],
  [3, 0, 1, 2],
];

function randomInt(min: number, max: number, random: () => number): number {
  return min + Math.floor(random() * (max - min + 1));
}

function createVisited(width: number, height: number): boolean[][] {
  return Array.from({ length: height }, () => new Array<boolean>(width).fill(false));
}

function createMotifMap(
  width: number,
  height: number,
  random: () => number,
): number[][] {
  const map: number[][] = Array.from(
    { length: height },
    () => new Array<number>(width).fill(0),
  );

  function fillRegion(
    r0: number,
    c0: number,
    r1: number,
    c1: number,
    motif: number,
  ): void {
    if (r0 > r1 || c0 > c1) {
      return;
    }

    const regionWidth = c1 - c0 + 1;
    const regionHeight = r1 - r0 + 1;

    if (regionWidth <= 2 || regionHeight <= 2) {
      for (let row = r0; row <= r1; row++) {
        for (let col = c0; col <= c1; col++) {
          map[row][col] = motif;
        }
      }
      return;
    }

    const midRow = Math.floor((r0 + r1) / 2);
    const midCol = Math.floor((c0 + c1) / 2);
    const rotation = Math.floor(random() * 4);

    const nw = (motif + rotation) % 4;
    const ne = (nw + 1) % 4;
    const sw = (nw + 3) % 4;
    const se = (nw + 2) % 4;

    fillRegion(r0, c0, midRow, midCol, nw);
    fillRegion(r0, midCol + 1, midRow, c1, ne);
    fillRegion(midRow + 1, c0, r1, midCol, sw);
    fillRegion(midRow + 1, midCol + 1, r1, c1, se);
  }

  fillRegion(0, 0, height - 1, width - 1, Math.floor(random() * 4));
  return map;
}

function carveTileSubstitution(
  grid: MazeMatrix,
  width: number,
  height: number,
  random: () => number,
  onStep?: (grid: MazeMatrix) => void,
): void {
  const motifMap = createMotifMap(width, height, random);
  const visited = createVisited(width, height);

  const startRow = Math.floor(random() * height);
  const startCol = Math.floor(random() * width);
  const stack: Cell[] = [{ row: startRow, col: startCol }];

  visited[startRow][startCol] = true;
  markCell(grid, startRow, startCol);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    if (current === undefined) {
      break;
    }

    const order = MOTIF_ORDERS[motifMap[current.row][current.col]];
    const candidates: Cell[] = [];

    for (const directionId of order) {
      const direction = DIRECTIONS[directionId];
      const nextRow = current.row + direction.dr;
      const nextCol = current.col + direction.dc;

      if (
        nextRow >= 0 &&
        nextRow < height &&
        nextCol >= 0 &&
        nextCol < width &&
        !visited[nextRow][nextCol]
      ) {
        candidates.push({ row: nextRow, col: nextCol });
      }
    }

    if (candidates.length === 0) {
      stack.pop();
      continue;
    }

    // Keep motif bias but still allow variation between runs with different seeds.
    const pickLimit = Math.min(2, candidates.length);
    const next = candidates[Math.floor(random() * pickLimit)];

    visited[next.row][next.col] = true;
    carvePassage(grid, current.row, current.col, next.row, next.col);
    onStep?.(grid);
    stack.push(next);
  }
}

function carveLocalTree(
  grid: MazeMatrix,
  random: () => number,
  region: Region,
  onStep?: (grid: MazeMatrix) => void,
): void {
  const width = region.c1 - region.c0 + 1;
  const height = region.r1 - region.r0 + 1;
  const visited = createVisited(width, height);

  const startRow = region.r0 + Math.floor(random() * height);
  const startCol = region.c0 + Math.floor(random() * width);
  const stack: Cell[] = [{ row: startRow, col: startCol }];

  visited[startRow - region.r0][startCol - region.c0] = true;
  markCell(grid, startRow, startCol);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    if (current === undefined) {
      break;
    }

    const dirs = [...DIRECTIONS];
    shuffle(dirs, random);

    let moved = false;
    for (const direction of dirs) {
      const nextRow = current.row + direction.dr;
      const nextCol = current.col + direction.dc;

      if (
        nextRow >= region.r0 &&
        nextRow <= region.r1 &&
        nextCol >= region.c0 &&
        nextCol <= region.c1 &&
        !visited[nextRow - region.r0][nextCol - region.c0]
      ) {
        visited[nextRow - region.r0][nextCol - region.c0] = true;
        carvePassage(grid, current.row, current.col, nextRow, nextCol);
        onStep?.(grid);
        stack.push({ row: nextRow, col: nextCol });
        moved = true;
        break;
      }
    }

    if (!moved) {
      stack.pop();
    }
  }
}

function isValidRegion(region: Region): boolean {
  return region.r0 <= region.r1 && region.c0 <= region.c1;
}

function connectQuadrants(
  grid: MazeMatrix,
  random: () => number,
  regions: Region[],
  onStep?: (grid: MazeMatrix) => void,
): void {
  if (regions.length <= 1) {
    return;
  }

  const edges: ConnectorEdge[] = [];

  const root = new Array<number>(regions.length).fill(0).map((_, index) => index);

  const find = (x: number): number => {
    if (root[x] === x) {
      return x;
    }
    root[x] = find(root[x]);
    return root[x];
  };

  const union = (a: number, b: number): boolean => {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) {
      return false;
    }
    root[rb] = ra;
    return true;
  };

  const addVerticalEdge = (a: number, b: number): void => {
    const left = regions[a];
    const right = regions[b];

    if (left.c1 + 1 !== right.c0) {
      return;
    }

    const rowMin = Math.max(left.r0, right.r0);
    const rowMax = Math.min(left.r1, right.r1);
    if (rowMin > rowMax) {
      return;
    }

    edges.push({
      a,
      b,
      carve: () => {
        const row = randomInt(rowMin, rowMax, random);
        carvePassage(grid, row, left.c1, row, right.c0);
      },
    });
  };

  const addHorizontalEdge = (a: number, b: number): void => {
    const top = regions[a];
    const bottom = regions[b];

    if (top.r1 + 1 !== bottom.r0) {
      return;
    }

    const colMin = Math.max(top.c0, bottom.c0);
    const colMax = Math.min(top.c1, bottom.c1);
    if (colMin > colMax) {
      return;
    }

    edges.push({
      a,
      b,
      carve: () => {
        const col = randomInt(colMin, colMax, random);
        carvePassage(grid, top.r1, col, bottom.r0, col);
      },
    });
  };

  for (let i = 0; i < regions.length; i++) {
    for (let j = i + 1; j < regions.length; j++) {
      addVerticalEdge(i, j);
      addVerticalEdge(j, i);
      addHorizontalEdge(i, j);
      addHorizontalEdge(j, i);
    }
  }

  shuffle(edges, random);

  for (const edge of edges) {
    if (union(edge.a, edge.b)) {
      edge.carve();
      onStep?.(grid);
    }
  }
}

function carveQuadtreeDivision(
  grid: MazeMatrix,
  random: () => number,
  region: Region,
  onStep?: (grid: MazeMatrix) => void,
): void {
  const regionWidth = region.c1 - region.c0 + 1;
  const regionHeight = region.r1 - region.r0 + 1;

  if (regionWidth <= 2 || regionHeight <= 2) {
    carveLocalTree(grid, random, region, onStep);
    return;
  }

  const midRow = Math.floor((region.r0 + region.r1) / 2);
  const midCol = Math.floor((region.c0 + region.c1) / 2);

  const quadrants: Region[] = [
    { r0: region.r0, c0: region.c0, r1: midRow, c1: midCol },
    { r0: region.r0, c0: midCol + 1, r1: midRow, c1: region.c1 },
    { r0: midRow + 1, c0: region.c0, r1: region.r1, c1: midCol },
    { r0: midRow + 1, c0: midCol + 1, r1: region.r1, c1: region.c1 },
  ].filter(isValidRegion);

  for (const quadrant of quadrants) {
    carveQuadtreeDivision(grid, random, quadrant, onStep);
  }

  connectQuadrants(grid, random, quadrants, onStep);
}

function resolveMode(config: MazeConfig): FractalMode {
  if (config.fractalMode === 'quadtree-division') {
    return 'quadtree-division';
  }
  return 'tile-substitution';
}

export class FractalTessellationGenerator implements IMazeGenerator {
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
    const mode = resolveMode(config);

    if (mode === 'tile-substitution') {
      carveTileSubstitution(grid, width, height, random, onStep);
      return grid;
    }

    carveQuadtreeDivision(grid, random, {
      r0: 0,
      c0: 0,
      r1: height - 1,
      c1: width - 1,
    }, onStep);

    return grid;
  }
}
