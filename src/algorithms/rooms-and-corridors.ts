/**
 * Rooms & Corridors maze generator.
 *
 * First places non-overlapping rectangular rooms, then connects room centers
 * with one of three strategies:
 * - manhattan-l: orthogonal L-shaped tunnels
 * - random-walk: biased random walk tunnels
 * - nearest-mst: nearest-center minimum spanning tree
 *
 * After rooms and connector corridors are carved, an iterative DFS expansion
 * incorporates every remaining cell into the same connected component so the
 * output remains a fully connected maze over all W×H cells.
 *
 * Time complexity:  O(W × H + R^2) where R is room count (graph stage).
 * Space complexity: O(W × H + R^2) for visited state and temporary edge list.
 */

import type {
  IMazeGenerator,
  MazeConfig,
  MazeMatrix,
  RoomsConnectionMode,
} from '../types';
import { createGrid, carvePassage, markCell, deepCopyMatrix } from '../utils/grid';
import { createRandom, shuffle } from '../utils/random';

interface Room {
  r0: number;
  c0: number;
  r1: number;
  c1: number;
}

interface Point {
  row: number;
  col: number;
}

interface Edge {
  from: number;
  to: number;
  distance: number;
}

const DIRECTIONS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function randomInt(min: number, max: number, random: () => number): number {
  return min + Math.floor(random() * (max - min + 1));
}

function getRoomCenter(room: Room): Point {
  return {
    row: Math.floor((room.r0 + room.r1) / 2),
    col: Math.floor((room.c0 + room.c1) / 2),
  };
}

function manhattan(a: Point, b: Point): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function roomOverlaps(a: Room, b: Room): boolean {
  return (
    a.r0 <= b.r1 + 1 &&
    a.r1 + 1 >= b.r0 &&
    a.c0 <= b.c1 + 1 &&
    a.c1 + 1 >= b.c0
  );
}

function placeRooms(width: number, height: number, random: () => number): Room[] {
  const maxRoomWidth = Math.max(1, Math.min(6, width));
  const maxRoomHeight = Math.max(1, Math.min(6, height));
  const minRoomWidth = Math.max(1, Math.min(2, maxRoomWidth));
  const minRoomHeight = Math.max(1, Math.min(2, maxRoomHeight));
  const attempts = Math.max(12, Math.floor((width * height) / 2));

  const rooms: Room[] = [];

  for (let i = 0; i < attempts; i++) {
    const roomWidth = randomInt(minRoomWidth, maxRoomWidth, random);
    const roomHeight = randomInt(minRoomHeight, maxRoomHeight, random);

    if (roomWidth > width || roomHeight > height) {
      continue;
    }

    const r0 = randomInt(0, height - roomHeight, random);
    const c0 = randomInt(0, width - roomWidth, random);
    const candidate: Room = {
      r0,
      c0,
      r1: r0 + roomHeight - 1,
      c1: c0 + roomWidth - 1,
    };

    const overlaps = rooms.some((room) => roomOverlaps(candidate, room));
    if (!overlaps) {
      rooms.push(candidate);
    }
  }

  if (rooms.length === 0) {
    const row = randomInt(0, height - 1, random);
    const col = randomInt(0, width - 1, random);
    rooms.push({ r0: row, c0: col, r1: row, c1: col });
  }

  return rooms;
}

function markVisited(visited: boolean[][], row: number, col: number): void {
  visited[row][col] = true;
}

function carveStep(
  grid: MazeMatrix,
  visited: boolean[][],
  currentRow: number,
  currentCol: number,
  nextRow: number,
  nextCol: number,
  onStep?: (grid: MazeMatrix) => void,
): void {
  if (!visited[currentRow][currentCol]) {
    markCell(grid, currentRow, currentCol);
    markVisited(visited, currentRow, currentCol);
  }

  carvePassage(grid, currentRow, currentCol, nextRow, nextCol);
  markVisited(visited, nextRow, nextCol);
  onStep?.(grid);
}

function carveRoom(grid: MazeMatrix, visited: boolean[][], room: Room): void {
  for (let row = room.r0; row <= room.r1; row++) {
    for (let col = room.c0; col <= room.c1; col++) {
      markCell(grid, row, col);
      markVisited(visited, row, col);
    }
  }

  for (let row = room.r0; row <= room.r1; row++) {
    for (let col = room.c0; col <= room.c1; col++) {
      if (row + 1 <= room.r1) {
        carvePassage(grid, row, col, row + 1, col);
      }
      if (col + 1 <= room.c1) {
        carvePassage(grid, row, col, row, col + 1);
      }
    }
  }
}

function carveManhattanL(
  grid: MazeMatrix,
  visited: boolean[][],
  from: Point,
  to: Point,
  random: () => number,
  onStep?: (grid: MazeMatrix) => void,
): void {
  let row = from.row;
  let col = from.col;

  const horizontalFirst = random() < 0.5;

  const stepHorizontal = (): void => {
    while (col !== to.col) {
      const nextCol = col + (to.col > col ? 1 : -1);
      carveStep(grid, visited, row, col, row, nextCol, onStep);
      col = nextCol;
    }
  };

  const stepVertical = (): void => {
    while (row !== to.row) {
      const nextRow = row + (to.row > row ? 1 : -1);
      carveStep(grid, visited, row, col, nextRow, col, onStep);
      row = nextRow;
    }
  };

  if (horizontalFirst) {
    stepHorizontal();
    stepVertical();
  } else {
    stepVertical();
    stepHorizontal();
  }
}

function carveRandomWalk(
  grid: MazeMatrix,
  visited: boolean[][],
  width: number,
  height: number,
  from: Point,
  to: Point,
  random: () => number,
  onStep?: (grid: MazeMatrix) => void,
): void {
  let row = from.row;
  let col = from.col;
  const limit = Math.max(32, width * height * 4);

  for (let step = 0; step < limit; step++) {
    if (row === to.row && col === to.col) {
      return;
    }

    const neighbors: Point[] = [];
    for (const [dr, dc] of DIRECTIONS) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
        neighbors.push({ row: nr, col: nc });
      }
    }

    if (neighbors.length === 0) {
      break;
    }

    const currentDistance = Math.abs(to.row - row) + Math.abs(to.col - col);
    const improving = neighbors.filter(
      (p) => Math.abs(to.row - p.row) + Math.abs(to.col - p.col) < currentDistance,
    );

    let next: Point;
    if (improving.length > 0 && random() < 0.75) {
      next = improving[Math.floor(random() * improving.length)] as Point;
    } else {
      next = neighbors[Math.floor(random() * neighbors.length)] as Point;
    }

    carveStep(grid, visited, row, col, next.row, next.col, onStep);
    row = next.row;
    col = next.col;
  }

  // Fallback to guaranteed completion with an L-path.
  carveManhattanL(grid, visited, { row, col }, to, random, onStep);
}

function buildNearestNeighborEdges(centers: Point[], random: () => number): Edge[] {
  if (centers.length <= 1) {
    return [];
  }

  const remaining = new Set<number>();
  for (let i = 0; i < centers.length; i++) {
    remaining.add(i);
  }

  const start = randomInt(0, centers.length - 1, random);
  remaining.delete(start);

  const edges: Edge[] = [];
  let current = start;

  while (remaining.size > 0) {
    let best: number | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const candidate of remaining) {
      const distance = manhattan(centers[current] as Point, centers[candidate] as Point);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    }

    if (best === null) {
      break;
    }

    edges.push({ from: current, to: best, distance: bestDistance });
    current = best;
    remaining.delete(best);
  }

  return edges;
}

function buildMstEdges(centers: Point[], random: () => number): Edge[] {
  if (centers.length <= 1) {
    return [];
  }

  const allEdges: Edge[] = [];
  for (let i = 0; i < centers.length; i++) {
    for (let j = i + 1; j < centers.length; j++) {
      allEdges.push({
        from: i,
        to: j,
        distance: manhattan(centers[i] as Point, centers[j] as Point),
      });
    }
  }

  shuffle(allEdges, random);
  allEdges.sort((a, b) => a.distance - b.distance);

  const parent = new Array<number>(centers.length).fill(0).map((_, idx) => idx);

  const find = (x: number): number => {
    if (parent[x] === x) {
      return x;
    }
    parent[x] = find(parent[x] as number);
    return parent[x] as number;
  };

  const union = (a: number, b: number): boolean => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) {
      return false;
    }
    parent[rootB] = rootA;
    return true;
  };

  const chosen: Edge[] = [];
  for (const edge of allEdges) {
    if (union(edge.from, edge.to)) {
      chosen.push(edge);
      if (chosen.length === centers.length - 1) {
        break;
      }
    }
  }

  return chosen;
}

function resolveMode(config: MazeConfig): RoomsConnectionMode {
  if (config.roomsConnectionMode === 'random-walk') {
    return 'random-walk';
  }
  if (config.roomsConnectionMode === 'nearest-mst') {
    return 'nearest-mst';
  }
  return 'manhattan-l';
}

function connectRooms(
  grid: MazeMatrix,
  visited: boolean[][],
  width: number,
  height: number,
  centers: Point[],
  mode: RoomsConnectionMode,
  random: () => number,
  onStep?: (grid: MazeMatrix) => void,
): void {
  const edges = mode === 'nearest-mst'
    ? buildMstEdges(centers, random)
    : buildNearestNeighborEdges(centers, random);

  for (const edge of edges) {
    const from = centers[edge.from] as Point;
    const to = centers[edge.to] as Point;

    if (mode === 'random-walk') {
      carveRandomWalk(grid, visited, width, height, from, to, random, onStep);
      continue;
    }

    carveManhattanL(grid, visited, from, to, random, onStep);
  }
}

function expandToAllCells(
  grid: MazeMatrix,
  width: number,
  height: number,
  visited: boolean[][],
  random: () => number,
  onStep?: (grid: MazeMatrix) => void,
): void {
  let start: Point | null = null;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (visited[row][col]) {
        start = { row, col };
        break;
      }
    }
    if (start !== null) {
      break;
    }
  }

  if (start === null) {
    start = { row: 0, col: 0 };
    markCell(grid, 0, 0);
    visited[0][0] = true;
  }

  const stack: Point[] = [start];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    if (current === undefined) {
      break;
    }

    const dirs = [...DIRECTIONS];
    shuffle(dirs, random);

    let moved = false;
    for (const [dr, dc] of dirs) {
      const nr = current.row + dr;
      const nc = current.col + dc;

      if (nr < 0 || nr >= height || nc < 0 || nc >= width || visited[nr][nc]) {
        continue;
      }

      carveStep(grid, visited, current.row, current.col, nr, nc, onStep);
      stack.push({ row: nr, col: nc });
      moved = true;
      break;
    }

    if (!moved) {
      stack.pop();
    }
  }

  // Any stragglers are attached to an already carved neighbor.
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (visited[row][col]) {
        continue;
      }

      markCell(grid, row, col);
      visited[row][col] = true;

      const neighbors: Point[] = [];
      for (const [dr, dc] of DIRECTIONS) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < height && nc >= 0 && nc < width && visited[nr][nc]) {
          neighbors.push({ row: nr, col: nc });
        }
      }

      if (neighbors.length > 0) {
        const pick = neighbors[Math.floor(random() * neighbors.length)] as Point;
        carvePassage(grid, row, col, pick.row, pick.col);
      }
    }
  }
}

export class RoomsAndCorridorsGenerator implements IMazeGenerator {
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

    const visited: boolean[][] = Array.from(
      { length: height },
      () => new Array<boolean>(width).fill(false),
    );

    const rooms = placeRooms(width, height, random);
    for (const room of rooms) {
      carveRoom(grid, visited, room);
    }

    const centers = rooms.map(getRoomCenter);
    connectRooms(grid, visited, width, height, centers, mode, random, onStep);

    // Ensure every logical maze cell is part of a single connected structure.
    expandToAllCells(grid, width, height, visited, random, onStep);

    // Keep entry and exit explicitly open.
    grid[1][0] = 1;
    grid[2 * height - 1][2 * width] = 1;
    onStep?.(grid);

    return grid;
  }
}
