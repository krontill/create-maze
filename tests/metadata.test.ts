import { describe, it, expect } from 'vitest';
import {
  Algorithm,
  ALGORITHM_VALUES,
  FORMAT_VALUES,
  isAlgorithm,
  isFormat,
  parseAlgorithm,
} from '../src';

describe('metadata algorithm catalog', () => {
  it('contains every algorithm enum value exactly once', () => {
    const unique = new Set(ALGORITHM_VALUES);
    const enumValues = new Set(Object.values(Algorithm));

    expect(unique.size).toBe(enumValues.size);
    expect(unique).toEqual(enumValues);
  });

  it('parses valid algorithms and falls back on invalid values', () => {
    expect(parseAlgorithm(Algorithm.DFS)).toBe(Algorithm.DFS);
    expect(parseAlgorithm('invalid')).toBe(Algorithm.DFS);
    expect(parseAlgorithm('invalid', Algorithm.PRIMS)).toBe(Algorithm.PRIMS);
    expect(isAlgorithm(Algorithm.WILSONS)).toBe(true);
    expect(isAlgorithm('not-an-algorithm')).toBe(false);
  });
});

describe('metadata format values', () => {
  it('contains both matrix and graph formats', () => {
    expect(FORMAT_VALUES).toContain('matrix');
    expect(FORMAT_VALUES).toContain('graph');
  });

  it('detects valid and invalid formats', () => {
    expect(isFormat('matrix')).toBe(true);
    expect(isFormat('graph')).toBe(true);
    expect(isFormat('other')).toBe(false);
  });
});
