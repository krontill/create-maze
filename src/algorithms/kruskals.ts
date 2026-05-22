/**
 * Randomised Kruskal's algorithm maze generator.
 *
 * Builds a perfect maze by treating every internal wall as an edge,
 * shuffling the edges, then removing each wall if the two cells it
 * separates belong to different connected components. A Disjoint Set
 * Union (DSU / Union-Find) structure with path compression and union
 * by rank tracks connectivity.
 *
 * Time complexity:  O(W × H × α(W × H)) ≈ O(W × H) amortised,
 *                   where α is the inverse Ackermann function.
 * Space complexity: O(W × H) — DSU arrays and edge list.
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, markCell, carvePassage } from '../utils/grid';
import { createRandom, shuffle } from '../utils/random';

// ---------------------------------------------------------------------------
// Disjoint Set Union (Union-Find) — iterative to avoid call-stack limits
// ---------------------------------------------------------------------------

interface DSU {
  parent: number[];
  rank: number[];
}

function createDSU(n: number): DSU {
  return {
    parent: Array.from({ length: n }, (_, i) => i),
    rank: new Array<number>(n).fill(0),
  };
}

/**
 * Iterative path-compressed find.
 *
 * Time complexity: O(α(n)) amortised
 */
function find(dsu: DSU, x: number): number {
  // Walk to root
  let root = x;
  while (dsu.parent[root] !== root) {
    root = dsu.parent[root] as number;
  }
  // Path compression: point every node on the path directly to root
  while (dsu.parent[x] !== root) {
    const next = dsu.parent[x] as number;
    dsu.parent[x] = root;
    x = next;
  }
  return root;
}

/**
 * Union by rank. Returns true if the sets were merged (x and y were
 * in different sets), false if they were already connected.
 *
 * Time complexity: O(α(n)) amortised
 */
function union(dsu: DSU, x: number, y: number): boolean {
  const rx = find(dsu, x);
  const ry = find(dsu, y);
  if (rx === ry) return false;

  const rankX = dsu.rank[rx] as number;
  const rankY = dsu.rank[ry] as number;

  if (rankX < rankY) {
    dsu.parent[rx] = ry;
  } else if (rankX > rankY) {
    dsu.parent[ry] = rx;
  } else {
    dsu.parent[ry] = rx;
    dsu.rank[rx] = rankX + 1;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Internal edge type
// ---------------------------------------------------------------------------

interface Edge {
  row1: number;
  col1: number;
  row2: number;
  col2: number;
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Kruskal's maze generator implementing the Strategy pattern via IMazeGenerator.
 */
export class KruskalsGenerator implements IMazeGenerator {
  /**
   * Generates a perfect maze using randomised Kruskal's algorithm.
   *
   * @param config - Validated maze configuration.
   * @returns MazeMatrix where 0 = wall, 1 = passage.
   */
  generate(config: MazeConfig): MazeMatrix {
    const { width, height, seed } = config;
    const random = createRandom(seed);
    const grid = createGrid(width, height);
    const dsu = createDSU(width * height);

    // Mark every cell as a passage and collect all internal walls (edges)
    const edges: Edge[] = [];

    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        markCell(grid, r, c);

        // Right neighbour edge
        if (c + 1 < width) {
          edges.push({ row1: r, col1: c, row2: r, col2: c + 1 });
        }
        // Bottom neighbour edge
        if (r + 1 < height) {
          edges.push({ row1: r, col1: c, row2: r + 1, col2: c });
        }
      }
    }

    // Shuffle edges, then greedily remove walls to build the spanning tree
    shuffle(edges, random);

    for (const { row1, col1, row2, col2 } of edges) {
      const id1 = row1 * width + col1;
      const id2 = row2 * width + col2;

      if (union(dsu, id1, id2)) {
        carvePassage(grid, row1, col1, row2, col2);
      }
    }

    return grid;
  }
}
