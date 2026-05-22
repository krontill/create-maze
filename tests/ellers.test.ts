import { describe, it, expect } from 'vitest';
import { generateMaze, Algorithm } from '../src/index';
import { isFullyConnected } from './helpers';

describe("Eller's Algorithm", () => {
  it('produces correct matrix dimensions for a square maze', () => {
    const m = generateMaze({ width: 5, height: 7, algorithm: Algorithm.ELLERS });
    expect(m).toHaveLength(15);    // 2*7+1
    expect(m[0]).toHaveLength(11); // 2*5+1
  });

  it('generates a fully connected maze', () => {
    const m = generateMaze({ width: 10, height: 10, algorithm: Algorithm.ELLERS });
    expect(isFullyConnected(m, 10, 10)).toBe(true);
  });

  it('is deterministic for a given seed', () => {
    const a = generateMaze({ width: 8, height: 8, algorithm: Algorithm.ELLERS, seed: 42 });
    const b = generateMaze({ width: 8, height: 8, algorithm: Algorithm.ELLERS, seed: 42 });
    expect(a).toEqual(b);
  });

  it('produces different mazes for different seeds', () => {
    const a = generateMaze({ width: 8, height: 8, algorithm: Algorithm.ELLERS, seed: 1 });
    const b = generateMaze({ width: 8, height: 8, algorithm: Algorithm.ELLERS, seed: 2 });
    expect(a).not.toEqual(b);
  });

  it('works with a wide non-square maze (5 rows × 10 cols)', () => {
    const m = generateMaze({ width: 10, height: 5, algorithm: Algorithm.ELLERS, seed: 7 });
    expect(m).toHaveLength(11);    // 2*5+1
    expect(m[0]).toHaveLength(21); // 2*10+1
    expect(isFullyConnected(m, 10, 5)).toBe(true);
  });

  it('works with a tall non-square maze (10 rows × 5 cols)', () => {
    const m = generateMaze({ width: 5, height: 10, algorithm: Algorithm.ELLERS, seed: 13 });
    expect(m).toHaveLength(21);    // 2*10+1
    expect(m[0]).toHaveLength(11); // 2*5+1
    expect(isFullyConnected(m, 5, 10)).toBe(true);
  });

  it('works with a single-row maze', () => {
    const m = generateMaze({ width: 6, height: 1, algorithm: Algorithm.ELLERS, seed: 99 });
    expect(m).toHaveLength(3);
    expect(m[0]).toHaveLength(13);
    expect(isFullyConnected(m, 6, 1)).toBe(true);
  });

  it('works with a single-column maze', () => {
    const m = generateMaze({ width: 1, height: 6, algorithm: Algorithm.ELLERS, seed: 77 });
    expect(m).toHaveLength(13);
    expect(m[0]).toHaveLength(3);
    expect(isFullyConnected(m, 1, 6)).toBe(true);
  });

  it('generates fully connected mazes across many seeds', () => {
    for (let seed = 0; seed < 20; seed++) {
      const m = generateMaze({ width: 12, height: 12, algorithm: Algorithm.ELLERS, seed });
      expect(isFullyConnected(m, 12, 12)).toBe(true);
    }
  });
});
