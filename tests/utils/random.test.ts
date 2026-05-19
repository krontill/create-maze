import { describe, it, expect } from 'vitest';
import { createRandom, shuffle } from '../../src/utils/random';

describe('createRandom', () => {
  it('returns a function that produces numbers in [0, 1)', () => {
    const rand = createRandom(42);
    for (let i = 0; i < 100; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('produces deterministic sequences for the same seed', () => {
    const a = createRandom(123);
    const b = createRandom(123);
    for (let i = 0; i < 20; i++) {
      expect(a()).toBe(b());
    }
  });

  it('produces different sequences for different seeds', () => {
    const a = Array.from({ length: 10 }, createRandom(1));
    const b = Array.from({ length: 10 }, createRandom(2));
    expect(a).not.toEqual(b);
  });
});

describe('shuffle', () => {
  it('preserves array length', () => {
    const arr = [1, 2, 3, 4, 5];
    shuffle(arr, createRandom(0));
    expect(arr).toHaveLength(5);
  });

  it('preserves the same elements (multiset equality)', () => {
    const original = [1, 2, 3, 4, 5];
    const arr = [...original];
    shuffle(arr, createRandom(7));
    expect(arr.sort()).toEqual(original.sort());
  });

  it('handles empty arrays without throwing', () => {
    const arr: number[] = [];
    expect(() => shuffle(arr, createRandom(0))).not.toThrow();
  });

  it('handles single-element arrays without throwing', () => {
    const arr = [42];
    shuffle(arr, createRandom(0));
    expect(arr).toEqual([42]);
  });
});
