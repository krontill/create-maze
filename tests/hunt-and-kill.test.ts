import { describe, it, expect } from 'vitest';
import { generateMaze, Algorithm } from '../src/index';
import { isFullyConnected } from './helpers';

describe('HuntAndKill', () => {
  it('produces correct matrix dimensions', () => {
    const m = generateMaze({ width: 5, height: 7, algorithm: Algorithm.HUNT_AND_KILL });
    expect(m).toHaveLength(15);   // 2 * 7 + 1
    expect(m[0]).toHaveLength(11); // 2 * 5 + 1
  });

  it('generates a fully connected maze', () => {
    const m = generateMaze({ width: 10, height: 10, algorithm: Algorithm.HUNT_AND_KILL });
    expect(isFullyConnected(m, 10, 10)).toBe(true);
  });

  it('is deterministic for a given seed', () => {
    const a = generateMaze({ width: 8, height: 8, algorithm: Algorithm.HUNT_AND_KILL, seed: 42 });
    const b = generateMaze({ width: 8, height: 8, algorithm: Algorithm.HUNT_AND_KILL, seed: 42 });
    expect(a).toEqual(b);
  });

  it('works with non-square mazes (wide)', () => {
    const m = generateMaze({ width: 10, height: 5, algorithm: Algorithm.HUNT_AND_KILL, seed: 7 });
    expect(m).toHaveLength(11);   // 2 * 5 + 1
    expect(m[0]).toHaveLength(21); // 2 * 10 + 1
    expect(isFullyConnected(m, 10, 5)).toBe(true);
  });

  it('works with non-square mazes (tall)', () => {
    const m = generateMaze({ width: 5, height: 10, algorithm: Algorithm.HUNT_AND_KILL, seed: 13 });
    expect(m).toHaveLength(21);   // 2 * 10 + 1
    expect(m[0]).toHaveLength(11); // 2 * 5 + 1
    expect(isFullyConnected(m, 5, 10)).toBe(true);
  });

  it('produces a different maze for a different seed', () => {
    const a = generateMaze({ width: 8, height: 8, algorithm: Algorithm.HUNT_AND_KILL, seed: 1 });
    const b = generateMaze({ width: 8, height: 8, algorithm: Algorithm.HUNT_AND_KILL, seed: 2 });
    expect(a).not.toEqual(b);
  });

  it('every cell body is open (1) in the matrix', () => {
    // Verifies that carvePassage is called in the correct direction during the
    // hunt phase so that the new cell's grid body is marked, not just the wall.
    const m = generateMaze({ width: 10, height: 10, algorithm: Algorithm.HUNT_AND_KILL, seed: 99 });
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        expect(m[2 * r + 1]?.[2 * c + 1]).toBe(1);
      }
    }
  });
});
