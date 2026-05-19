import { describe, it, expect } from 'vitest';
import { createGrid, markCell, carvePassage } from '../../src/utils/grid';

describe('createGrid', () => {
  it('returns a grid with dimensions (2H+1) × (2W+1)', () => {
    const g = createGrid(3, 4);
    expect(g).toHaveLength(9);      // 2*4+1
    expect(g[0]).toHaveLength(7);   // 2*3+1
  });

  it('initialises all cells to 0 (wall) except entry and exit', () => {
    const w = 3;
    const h = 3;
    const g = createGrid(w, h);

    for (let r = 0; r < 2 * h + 1; r++) {
      for (let c = 0; c < 2 * w + 1; c++) {
        const isEntry = r === 1 && c === 0;
        const isExit = r === 2 * h - 1 && c === 2 * w;
        expect(g[r][c]).toBe(isEntry || isExit ? 1 : 0);
      }
    }
  });

  it('opens entry at grid[1][0]', () => {
    const g = createGrid(5, 5);
    expect(g[1][0]).toBe(1);
  });

  it('opens exit at grid[2H-1][2W]', () => {
    const w = 5;
    const h = 5;
    const g = createGrid(w, h);
    expect(g[2 * h - 1][2 * w]).toBe(1);
  });
});

describe('markCell', () => {
  it('sets the grid position (2r+1, 2c+1) to 1', () => {
    const g = createGrid(3, 3);
    markCell(g, 1, 2);
    expect(g[3][5]).toBe(1);
  });
});

describe('carvePassage', () => {
  it('opens the destination cell and the wall between the two cells', () => {
    const g = createGrid(3, 3);
    markCell(g, 0, 0); // mark source
    carvePassage(g, 0, 0, 0, 1); // carve right

    expect(g[1][3]).toBe(1); // destination cell (0,1) at grid (1,3)
    expect(g[1][2]).toBe(1); // wall between (0,0) and (0,1) at grid (1,2)
  });

  it('opens a vertical passage correctly', () => {
    const g = createGrid(3, 3);
    markCell(g, 0, 0);
    carvePassage(g, 0, 0, 1, 0); // carve down

    expect(g[3][1]).toBe(1); // destination cell (1,0) at grid (3,1)
    expect(g[2][1]).toBe(1); // wall between (0,0) and (1,0) at grid (2,1)
  });
});
