import { describe, it, expect } from 'vitest';
import { generateMaze, Algorithm } from '../src/index';
import { isFullyConnected } from './helpers';

describe('Rooms & Corridors', () => {
  it('produces correct matrix dimensions', () => {
    const m = generateMaze({
      width: 5,
      height: 7,
      algorithm: Algorithm.ROOMS_AND_CORRIDORS,
      seed: 1,
    });

    expect(m).toHaveLength(15); // 2*7+1
    expect(m[0]).toHaveLength(11); // 2*5+1
  });

  it('generates a fully connected maze', () => {
    const m = generateMaze({
      width: 10,
      height: 10,
      algorithm: Algorithm.ROOMS_AND_CORRIDORS,
      seed: 42,
    });

    expect(isFullyConnected(m, 10, 10)).toBe(true);
  });

  it('is deterministic for a given seed and mode', () => {
    const a = generateMaze({
      width: 8,
      height: 8,
      algorithm: Algorithm.ROOMS_AND_CORRIDORS,
      roomsConnectionMode: 'nearest-mst',
      seed: 42,
    });
    const b = generateMaze({
      width: 8,
      height: 8,
      algorithm: Algorithm.ROOMS_AND_CORRIDORS,
      roomsConnectionMode: 'nearest-mst',
      seed: 42,
    });

    expect(a).toEqual(b);
  });

  it('works with non-square mazes (wide)', () => {
    const m = generateMaze({
      width: 10,
      height: 5,
      algorithm: Algorithm.ROOMS_AND_CORRIDORS,
      roomsConnectionMode: 'manhattan-l',
      seed: 7,
    });

    expect(isFullyConnected(m, 10, 5)).toBe(true);
  });

  it('works with non-square mazes (tall)', () => {
    const m = generateMaze({
      width: 5,
      height: 10,
      algorithm: Algorithm.ROOMS_AND_CORRIDORS,
      roomsConnectionMode: 'random-walk',
      seed: 7,
    });

    expect(isFullyConnected(m, 5, 10)).toBe(true);
  });

  it('produces three different mazes for the same seed across connection modes', () => {
    const manhattan = generateMaze({
      width: 12,
      height: 12,
      algorithm: Algorithm.ROOMS_AND_CORRIDORS,
      roomsConnectionMode: 'manhattan-l',
      seed: 9,
    });
    const randomWalk = generateMaze({
      width: 12,
      height: 12,
      algorithm: Algorithm.ROOMS_AND_CORRIDORS,
      roomsConnectionMode: 'random-walk',
      seed: 9,
    });
    const nearestMst = generateMaze({
      width: 12,
      height: 12,
      algorithm: Algorithm.ROOMS_AND_CORRIDORS,
      roomsConnectionMode: 'nearest-mst',
      seed: 9,
    });

    expect(manhattan).not.toEqual(randomWalk);
    expect(manhattan).not.toEqual(nearestMst);
    expect(randomWalk).not.toEqual(nearestMst);
  });

  it('defaults to manhattan-l when mode is omitted', () => {
    const explicit = generateMaze({
      width: 8,
      height: 8,
      algorithm: Algorithm.ROOMS_AND_CORRIDORS,
      roomsConnectionMode: 'manhattan-l',
      seed: 5,
    });
    const implicit = generateMaze({
      width: 8,
      height: 8,
      algorithm: Algorithm.ROOMS_AND_CORRIDORS,
      seed: 5,
    });

    expect(implicit).toEqual(explicit);
  });
});
