/**
 * Voronoi Diagram maze generator.
 *
 * Partitions the logical cell grid into Voronoi regions, carves a spanning
 * forest inside each region, then joins regions with inter-region passages
 * until all cells form one connected spanning tree.
 *
 * Time complexity:  O(W x H x S + W x H x alpha(W x H)) where S is site count.
 * Space complexity: O(W x H + S).
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix, VoronoiPreset } from '../types';
import { createGrid, carvePassage, markCell, deepCopyMatrix } from '../utils/grid';
import { createRandom, shuffle } from '../utils/random';

type Cell = [row: number, col: number];

interface CandidateEdge {
  from: Cell;
  to: Cell;
  fromId: number;
  toId: number;
}

const DIRECTIONS: Cell[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

class DisjointSet {
  private readonly parent: number[];

  private readonly rank: number[];

  private components: number;

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, idx) => idx);
    this.rank = new Array<number>(size).fill(0);
    this.components = size;
  }

  find(value: number): number {
    if (this.parent[value] !== value) {
      this.parent[value] = this.find(this.parent[value]);
    }
    return this.parent[value];
  }

  union(a: number, b: number): boolean {
    const rootA = this.find(a);
    const rootB = this.find(b);

    if (rootA === rootB) {
      return false;
    }

    if (this.rank[rootA] < this.rank[rootB]) {
      this.parent[rootA] = rootB;
    } else if (this.rank[rootA] > this.rank[rootB]) {
      this.parent[rootB] = rootA;
    } else {
      this.parent[rootB] = rootA;
      this.rank[rootA] += 1;
    }

    this.components -= 1;
    return true;
  }

  count(): number {
    return this.components;
  }
}

function toCellId(row: number, col: number, width: number): number {
  return row * width + col;
}

function chooseSiteCount(width: number, height: number, preset: VoronoiPreset): number {
  const total = width * height;
  if (preset === 'structured') {
    const suggested = Math.round(Math.sqrt(total));
    return Math.max(4, Math.min(total, Math.min(36, suggested)));
  }

  const suggested = Math.round(Math.sqrt(total) / 2);
  return Math.max(3, Math.min(total, Math.min(24, suggested)));
}

function pickRandomSites(width: number, height: number, count: number, random: () => number): Cell[] {
  const total = width * height;
  const ids = Array.from({ length: total }, (_, idx) => idx);
  shuffle(ids, random);

  return ids.slice(0, count).map((id) => {
    const row = Math.floor(id / width);
    const col = id % width;
    return [row, col];
  });
}

function pickStructuredSites(width: number, height: number, count: number, random: () => number): Cell[] {
  const sites: Cell[] = [];
  const rowBins = Math.max(1, Math.round(Math.sqrt(count * (height / width))));
  const colBins = Math.max(1, Math.ceil(count / rowBins));

  for (let rowBin = 0; rowBin < rowBins; rowBin += 1) {
    for (let colBin = 0; colBin < colBins; colBin += 1) {
      if (sites.length >= count) {
        break;
      }

      const rowStart = Math.floor((rowBin * height) / rowBins);
      const rowEnd = Math.max(rowStart + 1, Math.floor(((rowBin + 1) * height) / rowBins));
      const colStart = Math.floor((colBin * width) / colBins);
      const colEnd = Math.max(colStart + 1, Math.floor(((colBin + 1) * width) / colBins));

      const row = rowStart + Math.floor(random() * (rowEnd - rowStart));
      const col = colStart + Math.floor(random() * (colEnd - colStart));
      sites.push([Math.min(row, height - 1), Math.min(col, width - 1)]);
    }
  }

  return sites;
}

function pickSites(
  width: number,
  height: number,
  count: number,
  preset: VoronoiPreset,
  random: () => number,
): Cell[] {
  if (preset === 'structured') {
    return pickStructuredSites(width, height, count, random);
  }

  return pickRandomSites(width, height, count, random);
}

function distanceBetween(
  row: number,
  col: number,
  siteRow: number,
  siteCol: number,
  preset: VoronoiPreset,
): number {
  const dr = Math.abs(row - siteRow);
  const dc = Math.abs(col - siteCol);
  if (preset === 'structured') {
    // Structured mode uses Manhattan distance for straighter region boundaries.
    return dr + dc;
  }

  return dr * dr + dc * dc;
}

function assignVoronoiRegions(
  width: number,
  height: number,
  sites: Cell[],
  preset: VoronoiPreset,
): number[][] {
  const labels: number[][] = Array.from(
    { length: height },
    () => new Array<number>(width).fill(0),
  );

  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      let bestSite = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let siteIndex = 0; siteIndex < sites.length; siteIndex += 1) {
        const [siteRow, siteCol] = sites[siteIndex];
        const distance = distanceBetween(row, col, siteRow, siteCol, preset);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestSite = siteIndex;
        }
      }

      labels[row][col] = bestSite;
    }
  }

  return labels;
}

function carveIntraRegionForest(
  grid: MazeMatrix,
  width: number,
  height: number,
  labels: number[][],
  regionCount: number,
  random: () => number,
  dsu: DisjointSet,
  onStep?: (grid: MazeMatrix) => void,
): void {
  const visitedByRegion: boolean[][] = Array.from(
    { length: regionCount },
    () => new Array<boolean>(width * height).fill(false),
  );

  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const region = labels[row][col];
      const rootId = toCellId(row, col, width);
      if (visitedByRegion[region][rootId]) {
        continue;
      }

      const stack: Cell[] = [[row, col]];
      visitedByRegion[region][rootId] = true;

      while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top === undefined) {
          break;
        }
        const [curRow, curCol] = top;

        const dirs = [...DIRECTIONS];
        shuffle(dirs, random);

        let moved = false;

        for (const [dr, dc] of dirs) {
          const nextRow = curRow + dr;
          const nextCol = curCol + dc;

          if (
            nextRow < 0 || nextRow >= height ||
            nextCol < 0 || nextCol >= width ||
            labels[nextRow][nextCol] !== region
          ) {
            continue;
          }

          const nextId = toCellId(nextRow, nextCol, width);
          if (visitedByRegion[region][nextId]) {
            continue;
          }

          visitedByRegion[region][nextId] = true;
          carvePassage(grid, curRow, curCol, nextRow, nextCol);
          dsu.union(toCellId(curRow, curCol, width), nextId);
          stack.push([nextRow, nextCol]);
          onStep?.(grid);
          moved = true;
          break;
        }

        if (!moved) {
          stack.pop();
        }
      }
    }
  }
}

function collectEdges(width: number, height: number, labels: number[][]): {
  interRegion: CandidateEdge[];
  all: CandidateEdge[];
} {
  const interRegion: CandidateEdge[] = [];
  const all: CandidateEdge[] = [];

  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const fromId = toCellId(row, col, width);

      if (row + 1 < height) {
        const to: Cell = [row + 1, col];
        const toId = toCellId(to[0], to[1], width);
        const edge: CandidateEdge = { from: [row, col], to, fromId, toId };
        all.push(edge);
        if (labels[row][col] !== labels[to[0]][to[1]]) {
          interRegion.push(edge);
        }
      }

      if (col + 1 < width) {
        const to: Cell = [row, col + 1];
        const toId = toCellId(to[0], to[1], width);
        const edge: CandidateEdge = { from: [row, col], to, fromId, toId };
        all.push(edge);
        if (labels[row][col] !== labels[to[0]][to[1]]) {
          interRegion.push(edge);
        }
      }
    }
  }

  return { interRegion, all };
}

function connectWithEdges(
  grid: MazeMatrix,
  dsu: DisjointSet,
  edges: CandidateEdge[],
  onStep?: (grid: MazeMatrix) => void,
): void {
  for (const edge of edges) {
    if (dsu.union(edge.fromId, edge.toId)) {
      carvePassage(grid, edge.from[0], edge.from[1], edge.to[0], edge.to[1]);
      onStep?.(grid);
    }
  }
}

export class VoronoiDiagramGenerator implements IMazeGenerator {
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
    const preset: VoronoiPreset = config.voronoiPreset ?? 'natural';
    const random = createRandom(seed);
    const grid = createGrid(width, height);

    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width; col += 1) {
        markCell(grid, row, col);
      }
    }

    const siteCount = chooseSiteCount(width, height, preset);
    const sites = pickSites(width, height, siteCount, preset, random);
    const labels = assignVoronoiRegions(width, height, sites, preset);

    const dsu = new DisjointSet(width * height);
    carveIntraRegionForest(grid, width, height, labels, siteCount, random, dsu, onStep);

    const edgeSets = collectEdges(width, height, labels);
    shuffle(edgeSets.interRegion, random);
    connectWithEdges(grid, dsu, edgeSets.interRegion, onStep);

    if (dsu.count() > 1) {
      shuffle(edgeSets.all, random);
      connectWithEdges(grid, dsu, edgeSets.all, onStep);
    }

    return grid;
  }
}