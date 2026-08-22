import { describe, expect, it } from 'vitest';
import { getNextCanvasPosition } from '../sandbox/game-canvas-movement';

describe('canvas game movement', () => {
  it('moves one square only when the destination is a passage', () => {
    const matrix = [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 1],
    ];

    expect(getNextCanvasPosition(matrix, 1, 1, 0, -1)).toEqual({ row: 1, col: 0 });
  });
});
