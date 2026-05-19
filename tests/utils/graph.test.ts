import { describe, it, expect } from 'vitest';
import { generateMaze, Algorithm, Format } from '../../src/index';
import { matrixToGraph } from '../../src/utils/graph';

describe('matrixToGraph', () => {
  it('returns one node per cell', () => {
    const w = 3;
    const h = 4;
    const matrix = generateMaze({ width: w, height: h, algorithm: Algorithm.DFS, seed: 1 });
    const graph = matrixToGraph(matrix, w, h);
    expect(graph).toHaveLength(w * h);
  });

  it('assigns correct id, x, y to each node', () => {
    const w = 3;
    const h = 3;
    const matrix = generateMaze({ width: w, height: h, algorithm: Algorithm.DFS, seed: 1 });
    const graph = matrixToGraph(matrix, w, h);

    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        const node = graph[r * w + c];
        expect(node?.id).toBe(r * w + c);
        expect(node?.x).toBe(c);
        expect(node?.y).toBe(r);
      }
    }
  });

  it('produces bidirectional edges (if A→B then B→A)', () => {
    const w = 4;
    const h = 4;
    const matrix = generateMaze({ width: w, height: h, algorithm: Algorithm.DFS, seed: 5 });
    const graph = matrixToGraph(matrix, w, h);

    for (const node of graph) {
      for (const neighborId of node.neighbors) {
        const neighbor = graph[neighborId];
        expect(neighbor?.neighbors).toContain(node.id);
      }
    }
  });

  it('is consistent with Format.GRAPH output from generateMaze', () => {
    const cfg = { width: 4, height: 4, algorithm: Algorithm.DFS as Algorithm, seed: 10 };
    const matrix = generateMaze({ ...cfg, format: Format.MATRIX });
    const graphViaUtil = matrixToGraph(matrix, cfg.width, cfg.height);
    const graphViaMaze = generateMaze({ ...cfg, format: Format.GRAPH });
    expect(graphViaMaze).toEqual(graphViaUtil);
  });
});
