import { describe, it, expect } from 'vitest';
import { generateMaze, generateMazeSteps, Algorithm } from '../src/index';
import { isFullyConnected } from './helpers';

describe('CellularAutomaton', () => {
  it('produces correct matrix dimensions', () => {
    const m = generateMaze({ width: 5, height: 7, algorithm: Algorithm.CELLULAR_AUTOMATON });
    expect(m).toHaveLength(15);    // 2*7+1
    expect(m[0]).toHaveLength(11); // 2*5+1
  });

  it('generates a fully connected maze', () => {
    const m = generateMaze({ width: 10, height: 10, algorithm: Algorithm.CELLULAR_AUTOMATON, seed: 1 });
    expect(isFullyConnected(m, 10, 10)).toBe(true);
  });

  it('is deterministic for a given seed', () => {
    const a = generateMaze({ width: 8, height: 8, algorithm: Algorithm.CELLULAR_AUTOMATON, seed: 42 });
    const b = generateMaze({ width: 8, height: 8, algorithm: Algorithm.CELLULAR_AUTOMATON, seed: 42 });
    expect(a).toEqual(b);
  });

  it('works with non-square mazes (wide)', () => {
    const m = generateMaze({ width: 10, height: 5, algorithm: Algorithm.CELLULAR_AUTOMATON, seed: 7 });
    expect(m).toHaveLength(11);    // 2*5+1
    expect(m[0]).toHaveLength(21); // 2*10+1
    expect(isFullyConnected(m, 10, 5)).toBe(true);
  });

  it('works with non-square mazes (tall)', () => {
    const m = generateMaze({ width: 5, height: 10, algorithm: Algorithm.CELLULAR_AUTOMATON, seed: 7 });
    expect(m).toHaveLength(21);    // 2*10+1
    expect(m[0]).toHaveLength(11); // 2*5+1
    expect(isFullyConnected(m, 5, 10)).toBe(true);
  });

  it('returns steps with matching final dimensions', () => {
    const steps = generateMazeSteps({ width: 6, height: 6, algorithm: Algorithm.CELLULAR_AUTOMATON, seed: 99 });
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last).toHaveLength(13);    // 2*6+1
    expect(last[0]).toHaveLength(13); // 2*6+1
  });

  it('final step is fully connected', () => {
    const steps = generateMazeSteps({ width: 8, height: 8, algorithm: Algorithm.CELLULAR_AUTOMATON, seed: 55 });
    const last = steps[steps.length - 1];
    expect(isFullyConnected(last, 8, 8)).toBe(true);
  });

  it('respects caFillRatio param — high fill produces more open maze', () => {
    const sparse = generateMaze({ width: 10, height: 10, algorithm: Algorithm.CELLULAR_AUTOMATON, seed: 1, caFillRatio: 0.2 });
    const dense  = generateMaze({ width: 10, height: 10, algorithm: Algorithm.CELLULAR_AUTOMATON, seed: 1, caFillRatio: 0.8 });
    const countOnes = (m: number[][]) => m.flat().filter(v => v === 1).length;
    // Dense fill should produce more passage cells than sparse fill
    expect(countOnes(dense)).toBeGreaterThan(countOnes(sparse));
  });

  it('respects caGenerations param — different generations produce different output', () => {
    const g1 = generateMaze({ width: 10, height: 10, algorithm: Algorithm.CELLULAR_AUTOMATON, seed: 1, caGenerations: 1 });
    const g8 = generateMaze({ width: 10, height: 10, algorithm: Algorithm.CELLULAR_AUTOMATON, seed: 1, caGenerations: 8 });
    expect(g1).not.toEqual(g8);
    expect(isFullyConnected(g1, 10, 10)).toBe(true);
    expect(isFullyConnected(g8, 10, 10)).toBe(true);
  });

  it('throws RangeError for caFillRatio out of range', () => {
    expect(() => generateMaze({ width: 5, height: 5, algorithm: Algorithm.CELLULAR_AUTOMATON, caFillRatio: 0 })).toThrow(RangeError);
    expect(() => generateMaze({ width: 5, height: 5, algorithm: Algorithm.CELLULAR_AUTOMATON, caFillRatio: 1 })).toThrow(RangeError);
    expect(() => generateMaze({ width: 5, height: 5, algorithm: Algorithm.CELLULAR_AUTOMATON, caFillRatio: -0.1 })).toThrow(RangeError);
  });

  it('throws RangeError for caGenerations < 1', () => {
    expect(() => generateMaze({ width: 5, height: 5, algorithm: Algorithm.CELLULAR_AUTOMATON, caGenerations: 0 })).toThrow(RangeError);
    expect(() => generateMaze({ width: 5, height: 5, algorithm: Algorithm.CELLULAR_AUTOMATON, caGenerations: -1 })).toThrow(RangeError);
  });
});
