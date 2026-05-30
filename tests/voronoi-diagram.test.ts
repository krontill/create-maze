import { describe, it, expect } from 'vitest';
import { generateMaze, Algorithm } from '../src/index';
import { isFullyConnected } from './helpers';

describe('Voronoi Diagram', () => {
  it('produces correct matrix dimensions', () => {
    const m = generateMaze({
      width: 5,
      height: 7,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      seed: 1,
    });

    expect(m).toHaveLength(15); // 2*7+1
    expect(m[0]).toHaveLength(11); // 2*5+1
  });

  it('generates a fully connected maze', () => {
    const m = generateMaze({
      width: 10,
      height: 10,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      seed: 42,
    });

    expect(isFullyConnected(m, 10, 10)).toBe(true);
  });

  it('is deterministic for a given seed', () => {
    const a = generateMaze({
      width: 8,
      height: 8,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      seed: 42,
    });
    const b = generateMaze({
      width: 8,
      height: 8,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      seed: 42,
    });

    expect(a).toEqual(b);
  });

  it('works with non-square mazes (wide)', () => {
    const m = generateMaze({
      width: 10,
      height: 5,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      seed: 7,
    });

    expect(isFullyConnected(m, 10, 5)).toBe(true);
  });

  it('works with non-square mazes (tall)', () => {
    const m = generateMaze({
      width: 5,
      height: 10,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      seed: 7,
    });

    expect(isFullyConnected(m, 5, 10)).toBe(true);
  });

  it('produces different mazes with different seeds', () => {
    const a = generateMaze({
      width: 12,
      height: 12,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      seed: 1,
    });
    const b = generateMaze({
      width: 12,
      height: 12,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      seed: 2,
    });

    expect(a).not.toEqual(b);
  });

  it('structured preset generates a fully connected maze', () => {
    const m = generateMaze({
      width: 10,
      height: 10,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'structured',
      seed: 42,
    });

    expect(isFullyConnected(m, 10, 10)).toBe(true);
  });

  it('structured preset works with non-square mazes', () => {
    const wide = generateMaze({
      width: 10,
      height: 5,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'structured',
      seed: 7,
    });
    const tall = generateMaze({
      width: 5,
      height: 10,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'structured',
      seed: 7,
    });

    expect(isFullyConnected(wide, 10, 5)).toBe(true);
    expect(isFullyConnected(tall, 5, 10)).toBe(true);
  });

  it('is deterministic for the structured preset', () => {
    const a = generateMaze({
      width: 10,
      height: 10,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'structured',
      seed: 22,
    });
    const b = generateMaze({
      width: 10,
      height: 10,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'structured',
      seed: 22,
    });

    expect(a).toEqual(b);
  });

  it('natural and structured presets produce different mazes with same seed', () => {
    const natural = generateMaze({
      width: 12,
      height: 12,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'natural',
      seed: 14,
    });
    const structured = generateMaze({
      width: 12,
      height: 12,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'structured',
      seed: 14,
    });

    expect(natural).not.toEqual(structured);
  });

  it('defaults to natural preset when omitted', () => {
    const explicitNatural = generateMaze({
      width: 10,
      height: 10,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'natural',
      seed: 33,
    });
    const implicitDefault = generateMaze({
      width: 10,
      height: 10,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      seed: 33,
    });

    expect(implicitDefault).toEqual(explicitNatural);
  });
});