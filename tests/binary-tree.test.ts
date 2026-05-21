import { describe, it, expect } from 'vitest';
import { generateMaze, Algorithm } from '../src/index';
import { isFullyConnected } from './helpers';

describe('BinaryTree', () => {
  it('produces correct matrix dimensions', () => {
    const m = generateMaze({ width: 5, height: 7, algorithm: Algorithm.BINARY_TREE, seed: 1 });
    expect(m).toHaveLength(15);    // 2*7+1
    expect(m[0]).toHaveLength(11); // 2*5+1
  });

  it('generates a fully connected maze', () => {
    const m = generateMaze({ width: 10, height: 10, algorithm: Algorithm.BINARY_TREE, seed: 42 });
    expect(isFullyConnected(m, 10, 10)).toBe(true);
  });

  it('is deterministic for a given seed', () => {
    const a = generateMaze({ width: 8, height: 8, algorithm: Algorithm.BINARY_TREE, seed: 42 });
    const b = generateMaze({ width: 8, height: 8, algorithm: Algorithm.BINARY_TREE, seed: 42 });
    expect(a).toEqual(b);
  });

  it('works with non-square mazes (wide)', () => {
    const m = generateMaze({ width: 10, height: 5, algorithm: Algorithm.BINARY_TREE, seed: 7 });
    expect(isFullyConnected(m, 10, 5)).toBe(true);
  });

  it('works with non-square mazes (tall)', () => {
    const m = generateMaze({ width: 5, height: 10, algorithm: Algorithm.BINARY_TREE, seed: 7 });
    expect(isFullyConnected(m, 5, 10)).toBe(true);
  });

  it('only contains 0s and 1s', () => {
    const m = generateMaze({ width: 6, height: 6, algorithm: Algorithm.BINARY_TREE, seed: 3 });
    for (const row of m) {
      for (const cell of row) {
        expect(cell === 0 || cell === 1).toBe(true);
      }
    }
  });

  it('has open entry (grid[1][0]) and exit (grid[2H-1][2W])', () => {
    const w = 4;
    const h = 4;
    const m = generateMaze({ width: w, height: h, algorithm: Algorithm.BINARY_TREE, seed: 5 });
    expect(m[1][0]).toBe(1);
    expect(m[2 * h - 1][2 * w]).toBe(1);
  });

  it('handles a 1×1 maze', () => {
    const m = generateMaze({ width: 1, height: 1, algorithm: Algorithm.BINARY_TREE, seed: 0 });
    expect(m).toHaveLength(3);
    expect(m[0]).toHaveLength(3);
  });

  it('produces different mazes with different seeds', () => {
    const a = generateMaze({ width: 8, height: 8, algorithm: Algorithm.BINARY_TREE, seed: 1 });
    const b = generateMaze({ width: 8, height: 8, algorithm: Algorithm.BINARY_TREE, seed: 2 });
    expect(a).not.toEqual(b);
  });
});
