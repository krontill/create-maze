import { describe, it, expect } from 'vitest';
import { generateMaze, Algorithm } from '../src/index';
import { isFullyConnected } from './helpers';

describe('Fractal Tessellation', () => {
  it('produces correct matrix dimensions', () => {
    const m = generateMaze({
      width: 5,
      height: 7,
      algorithm: Algorithm.FRACTAL_TESSELLATION,
      fractalMode: 'tile-substitution',
      seed: 1,
    });

    expect(m).toHaveLength(15);
    expect(m[0]).toHaveLength(11);
  });

  it('generates a fully connected maze in tile substitution mode', () => {
    const m = generateMaze({
      width: 10,
      height: 10,
      algorithm: Algorithm.FRACTAL_TESSELLATION,
      fractalMode: 'tile-substitution',
      seed: 42,
    });

    expect(isFullyConnected(m, 10, 10)).toBe(true);
  });

  it('generates a fully connected maze in quadtree division mode', () => {
    const m = generateMaze({
      width: 10,
      height: 10,
      algorithm: Algorithm.FRACTAL_TESSELLATION,
      fractalMode: 'quadtree-division',
      seed: 42,
    });

    expect(isFullyConnected(m, 10, 10)).toBe(true);
  });

  it('is deterministic for a given seed and mode', () => {
    const a = generateMaze({
      width: 8,
      height: 8,
      algorithm: Algorithm.FRACTAL_TESSELLATION,
      fractalMode: 'quadtree-division',
      seed: 42,
    });
    const b = generateMaze({
      width: 8,
      height: 8,
      algorithm: Algorithm.FRACTAL_TESSELLATION,
      fractalMode: 'quadtree-division',
      seed: 42,
    });

    expect(a).toEqual(b);
  });

  it('produces two different mazes for the same seed across modes', () => {
    const tile = generateMaze({
      width: 12,
      height: 12,
      algorithm: Algorithm.FRACTAL_TESSELLATION,
      fractalMode: 'tile-substitution',
      seed: 9,
    });
    const quadtree = generateMaze({
      width: 12,
      height: 12,
      algorithm: Algorithm.FRACTAL_TESSELLATION,
      fractalMode: 'quadtree-division',
      seed: 9,
    });

    expect(tile).not.toEqual(quadtree);
  });

  it('works with non-square mazes (wide)', () => {
    const m = generateMaze({
      width: 10,
      height: 5,
      algorithm: Algorithm.FRACTAL_TESSELLATION,
      fractalMode: 'tile-substitution',
      seed: 7,
    });

    expect(isFullyConnected(m, 10, 5)).toBe(true);
  });

  it('works with non-square mazes (tall)', () => {
    const m = generateMaze({
      width: 5,
      height: 10,
      algorithm: Algorithm.FRACTAL_TESSELLATION,
      fractalMode: 'quadtree-division',
      seed: 7,
    });

    expect(isFullyConnected(m, 5, 10)).toBe(true);
  });

  it('defaults to tile substitution mode when fractalMode is omitted', () => {
    const explicit = generateMaze({
      width: 8,
      height: 8,
      algorithm: Algorithm.FRACTAL_TESSELLATION,
      fractalMode: 'tile-substitution',
      seed: 5,
    });
    const implicit = generateMaze({
      width: 8,
      height: 8,
      algorithm: Algorithm.FRACTAL_TESSELLATION,
      seed: 5,
    });

    expect(implicit).toEqual(explicit);
  });
});
