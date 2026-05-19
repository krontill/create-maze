import { describe, it, expect } from 'vitest';
import { generateMaze, Algorithm, Format } from '../src';
import { isFullyConnected } from './helpers';

// ---------------------------------------------------------------------------
// Shared behavioural tests run against every algorithm
// ---------------------------------------------------------------------------

const ALGORITHMS: Algorithm[] = [Algorithm.DFS, Algorithm.PRIMS, Algorithm.KRUSKALS];

for (const algorithm of ALGORITHMS) {
  describe(`generateMaze – ${algorithm}`, () => {
    it('returns a matrix of correct dimensions', () => {
      const w = 5;
      const h = 7;
      const maze = generateMaze({ width: w, height: h, algorithm, seed: 1 });
      expect(maze).toHaveLength(2 * h + 1);
      for (const row of maze) {
        expect(row).toHaveLength(2 * w + 1);
      }
    });

    it('only contains 0s and 1s', () => {
      const maze = generateMaze({ width: 4, height: 4, algorithm, seed: 2 });
      for (const row of maze) {
        for (const cell of row) {
          expect(cell === 0 || cell === 1).toBe(true);
        }
      }
    });

    it('has open entry (grid[1][0]) and exit (grid[2H-1][2W])', () => {
      const w = 4;
      const h = 4;
      const maze = generateMaze({ width: w, height: h, algorithm, seed: 3 });
      expect(maze[1][0]).toBe(1);
      expect(maze[2 * h - 1][2 * w]).toBe(1);
    });

    it('produces a fully connected maze (perfect maze)', () => {
      const w = 6;
      const h = 6;
      const maze = generateMaze({ width: w, height: h, algorithm, seed: 42 });
      expect(isFullyConnected(maze, w, h)).toBe(true);
    });

    it('is deterministic with the same seed', () => {
      const cfg = { width: 5, height: 5, algorithm, seed: 99 };
      expect(generateMaze(cfg)).toEqual(generateMaze(cfg));
    });

    it('produces different mazes with different seeds', () => {
      const a = generateMaze({ width: 5, height: 5, algorithm, seed: 1 });
      const b = generateMaze({ width: 5, height: 5, algorithm, seed: 2 });
      expect(a).not.toEqual(b);
    });

    it('handles a 1×1 maze', () => {
      const maze = generateMaze({ width: 1, height: 1, algorithm, seed: 0 });
      expect(maze).toHaveLength(3);
      expect(maze[0]).toHaveLength(3);
      expect(maze[1][1]).toBe(1); // the single cell is a passage
    });

    it('handles a 1×N maze (single row)', () => {
      const maze = generateMaze({ width: 5, height: 1, algorithm, seed: 7 });
      expect(isFullyConnected(maze, 5, 1)).toBe(true);
    });

    it('handles an N×1 maze (single column)', () => {
      const maze = generateMaze({ width: 1, height: 5, algorithm, seed: 7 });
      expect(isFullyConnected(maze, 1, 5)).toBe(true);
    });

    it('returns a MazeGraph when format is GRAPH', () => {
      const graph = generateMaze({ width: 3, height: 3, algorithm, format: Format.GRAPH, seed: 5 });
      expect(Array.isArray(graph)).toBe(true);
      expect(graph).toHaveLength(3 * 3);
      for (const node of graph) {
        expect(typeof node.id).toBe('number');
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
        expect(Array.isArray(node.neighbors)).toBe(true);
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Validation tests
// ---------------------------------------------------------------------------

describe('generateMaze – validation', () => {
  it('throws RangeError for width < 1', () => {
    expect(() =>
      generateMaze({ width: 0, height: 5, algorithm: Algorithm.DFS }),
    ).toThrow(RangeError);
  });

  it('throws RangeError for height < 1', () => {
    expect(() =>
      generateMaze({ width: 5, height: -1, algorithm: Algorithm.DFS }),
    ).toThrow(RangeError);
  });

  it('throws RangeError for non-integer width', () => {
    expect(() =>
      generateMaze({ width: 2.5, height: 5, algorithm: Algorithm.DFS }),
    ).toThrow(RangeError);
  });

  it('throws TypeError for invalid algorithm', () => {
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      generateMaze({ width: 5, height: 5, algorithm: 'bogus' as any }),
    ).toThrow(TypeError);
  });

  it('throws TypeError for invalid format', () => {
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      generateMaze({ width: 5, height: 5, algorithm: Algorithm.DFS, format: 'invalid' as any }),
    ).toThrow(TypeError);
  });

  it('throws TypeError for non-finite seed', () => {
    expect(() =>
      generateMaze({ width: 5, height: 5, algorithm: Algorithm.DFS, seed: Infinity }),
    ).toThrow(TypeError);
  });
});
