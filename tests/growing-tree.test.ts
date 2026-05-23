import { describe, it, expect } from 'vitest';
import { generateMaze, Algorithm } from '../src/index';
import { isFullyConnected } from './helpers';

describe('Growing Tree', () => {
  it('produces correct matrix dimensions', () => {
    const m = generateMaze({ width: 5, height: 7, algorithm: Algorithm.GROWING_TREE });
    expect(m).toHaveLength(15);    // 2*7+1
    expect(m[0]).toHaveLength(11); // 2*5+1
  });

  it('generates a fully connected maze', () => {
    const m = generateMaze({ width: 10, height: 10, algorithm: Algorithm.GROWING_TREE });
    expect(isFullyConnected(m, 10, 10)).toBe(true);
  });

  it('is deterministic for a given seed', () => {
    const a = generateMaze({ width: 8, height: 8, algorithm: Algorithm.GROWING_TREE, seed: 42 });
    const b = generateMaze({ width: 8, height: 8, algorithm: Algorithm.GROWING_TREE, seed: 42 });
    expect(a).toEqual(b);
  });

  it('produces different mazes for different seeds', () => {
    const a = generateMaze({ width: 8, height: 8, algorithm: Algorithm.GROWING_TREE, seed: 1 });
    const b = generateMaze({ width: 8, height: 8, algorithm: Algorithm.GROWING_TREE, seed: 2 });
    expect(a).not.toEqual(b);
  });

  it('works with non-square mazes (wide)', () => {
    const m = generateMaze({ width: 10, height: 5, algorithm: Algorithm.GROWING_TREE });
    expect(m).toHaveLength(11);    // 2*5+1
    expect(m[0]).toHaveLength(21); // 2*10+1
    expect(isFullyConnected(m, 10, 5)).toBe(true);
  });

  it('works with non-square mazes (tall)', () => {
    const m = generateMaze({ width: 5, height: 10, algorithm: Algorithm.GROWING_TREE });
    expect(m).toHaveLength(21);    // 2*10+1
    expect(m[0]).toHaveLength(11); // 2*5+1
    expect(isFullyConnected(m, 5, 10)).toBe(true);
  });

  it('works with a 1×1 maze', () => {
    const m = generateMaze({ width: 1, height: 1, algorithm: Algorithm.GROWING_TREE });
    expect(m).toHaveLength(3);
    expect(m[0]).toHaveLength(3);
  });
});
