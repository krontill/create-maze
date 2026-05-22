import { describe, it, expect } from 'vitest';
import { generateMaze, Algorithm } from '../src/index';
import { isFullyConnected } from './helpers';

describe('DFS', () => {
  it('produces correct matrix dimensions', () => {
    const m = generateMaze({ width: 5, height: 7, algorithm: Algorithm.DFS, seed: 1 });
    expect(m).toHaveLength(15);    // 2*7+1
    expect(m[0]).toHaveLength(11); // 2*5+1
  });

  it('generates a fully connected maze', () => {
    const m = generateMaze({ width: 10, height: 10, algorithm: Algorithm.DFS, seed: 42 });
    expect(isFullyConnected(m, 10, 10)).toBe(true);
  });

  it('is deterministic for a given seed', () => {
    const a = generateMaze({ width: 8, height: 8, algorithm: Algorithm.DFS, seed: 42 });
    const b = generateMaze({ width: 8, height: 8, algorithm: Algorithm.DFS, seed: 42 });
    expect(a).toEqual(b);
  });

  it('works with non-square mazes (wide)', () => {
    const m = generateMaze({ width: 10, height: 5, algorithm: Algorithm.DFS, seed: 7 });
    expect(isFullyConnected(m, 10, 5)).toBe(true);
  });

  it('works with non-square mazes (tall)', () => {
    const m = generateMaze({ width: 5, height: 10, algorithm: Algorithm.DFS, seed: 7 });
    expect(isFullyConnected(m, 5, 10)).toBe(true);
  });
});
