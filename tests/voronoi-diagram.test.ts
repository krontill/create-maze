import { describe, it, expect } from 'vitest';
import { generateMaze, Algorithm } from '../src/index';
import { isFullyConnected } from './helpers';

function countDeadEnds(matrix: number[][], width: number, height: number): number {
  let deadEnds = 0;

  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      let degree = 0;

      if (row > 0 && matrix[row + row][col + col + 1] === 1) {
        degree += 1;
      }
      if (row + 1 < height && matrix[row + row + 2][col + col + 1] === 1) {
        degree += 1;
      }
      if (col > 0 && matrix[row + row + 1][col + col] === 1) {
        degree += 1;
      }
      if (col + 1 < width && matrix[row + row + 1][col + col + 2] === 1) {
        degree += 1;
      }

      if (degree === 1) {
        deadEnds += 1;
      }
    }
  }

  return deadEnds;
}

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

  it('border-doors preset generates a fully connected maze', () => {
    const m = generateMaze({
      width: 10,
      height: 10,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'border-doors',
      seed: 42,
    });

    expect(isFullyConnected(m, 10, 10)).toBe(true);
  });

  it('is deterministic for the border-doors preset', () => {
    const a = generateMaze({
      width: 12,
      height: 8,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'border-doors',
      seed: 99,
    });
    const b = generateMaze({
      width: 12,
      height: 8,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'border-doors',
      seed: 99,
    });

    expect(a).toEqual(b);
  });

  it('border-doors-braided preset generates a fully connected maze', () => {
    const m = generateMaze({
      width: 10,
      height: 10,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'border-doors-braided',
      seed: 42,
    });

    expect(isFullyConnected(m, 10, 10)).toBe(true);
  });

  it('is deterministic for the border-doors-braided preset', () => {
    const a = generateMaze({
      width: 12,
      height: 8,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'border-doors-braided',
      seed: 99,
    });
    const b = generateMaze({
      width: 12,
      height: 8,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'border-doors-braided',
      seed: 99,
    });

    expect(a).toEqual(b);
  });

  it('is deterministic for the region-border-doors preset', () => {
    const a = generateMaze({
      width: 12,
      height: 8,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'region-border-doors',
      seed: 99,
    });
    const b = generateMaze({
      width: 12,
      height: 8,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'region-border-doors',
      seed: 99,
    });

    expect(a).toEqual(b);
  });

  it('border-doors preset keeps dead-end ratio moderate', () => {
    const width = 20;
    const height = 15;
    const matrix = generateMaze({
      width,
      height,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'border-doors',
      seed: 42,
    });

    const deadEnds = countDeadEnds(matrix, width, height);
    const ratio = deadEnds / (width * height);
    expect(ratio).toBeLessThanOrEqual(0.12);
  });

  it('border-doors-braided preset has fewer dead-ends than balanced border-doors', () => {
    const width = 20;
    const height = 15;
    const balanced = generateMaze({
      width,
      height,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'border-doors',
      seed: 42,
    });
    const braided = generateMaze({
      width,
      height,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'border-doors-braided',
      seed: 42,
    });

    const balancedDeadEnds = countDeadEnds(balanced, width, height);
    const braidedDeadEnds = countDeadEnds(braided, width, height);
    expect(braidedDeadEnds).toBeLessThanOrEqual(balancedDeadEnds);
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

  it('natural and border-doors presets produce different mazes with same seed', () => {
    const natural = generateMaze({
      width: 12,
      height: 12,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'natural',
      seed: 14,
    });
    const borderDoors = generateMaze({
      width: 12,
      height: 12,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'border-doors',
      seed: 14,
    });

    expect(natural).not.toEqual(borderDoors);
  });

  it('natural and region-border-doors presets produce different mazes with same seed', () => {
    const natural = generateMaze({
      width: 12,
      height: 12,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'natural',
      seed: 14,
    });
    const lovableBorderDoors = generateMaze({
      width: 12,
      height: 12,
      algorithm: Algorithm.VORONOI_DIAGRAM,
      voronoiPreset: 'region-border-doors',
      seed: 14,
    });

    expect(natural).not.toEqual(lovableBorderDoors);
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