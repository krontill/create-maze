---
name: add-algorithm
description: >
  Add a new maze generation algorithm to the maze-builder library. Use this
  skill whenever the user wants to implement, add, create, or register a new
  generation algorithm — even if they only mention it in passing (e.g. "add
  Wilson's", "implement binary tree maze", "new generator", "another algorithm").
  Covers all seven steps: enum registration, algorithm file, public API wiring,
  tests, sandbox demo card, and compare page wiring.
argument-hint: "[algorithm name]"
---

# add-algorithm

Add a new maze generation algorithm end-to-end: library code, tests, sandbox demo card, and compare page wiring.

## Overview

The library uses a **Strategy pattern**. Every algorithm is a class that implements `IMazeGenerator`. The public API resolves the correct class at runtime via a `GENERATORS` record keyed by the `Algorithm` enum. The demo page auto-discovers algorithms from HTML `data-algo` attributes — no JavaScript changes are needed when adding a card.

The sandbox compare page (`sandbox/compare.html` + `sandbox/compare.ts`) is separate from the card-based demo. It uses an explicit `ALGORITHMS` list in `sandbox/compare.ts`, so each new algorithm must also be added there.

## Steps

### 1 — Add the enum member (`src/types.ts`)

Open `src/types.ts` and add a new member to the `Algorithm` enum. The value must be a lowercase kebab-case string that will also be used as the `data-algo` attribute in the demo.

```typescript
export enum Algorithm {
  DFS      = 'dfs',
  PRIMS    = 'prims',
  KRUSKALS = 'kruskals',
  MY_ALGO  = 'my-algo',   // ← add this
}
```

### 2 — Implement the algorithm (`src/algorithms/<name>.ts`)

Create `src/algorithms/<name>.ts`. The class must implement `IMazeGenerator` and document time/space complexity.

**Canonical structure to follow (mirror `src/algorithms/dfs.ts`):**

```typescript
/**
 * <Algorithm name> maze generator.
 *
 * Time complexity:  O(…)
 * Space complexity: O(…)
 */

import type { IMazeGenerator, MazeConfig, MazeMatrix } from '../types';
import { createGrid, markCell, carvePassage } from '../utils/grid';
import { createRandom } from '../utils/random';

export class MyAlgoGenerator implements IMazeGenerator {
  generate(config: MazeConfig): MazeMatrix {
    const { width, height, seed } = config;
    const random = createRandom(seed);
    const grid = createGrid(width, height);

    // … algorithm logic …

    return grid;
  }
}
```

**Grid coordinate system** (`src/utils/grid.ts`):
- The output matrix is `(2H + 1) × (2W + 1)`.
- Cell `(r, c)` sits at grid position `(2r+1, 2c+1)`.
- Call `markCell(grid, r, c)` to open a cell.
- Call `carvePassage(grid, fromRow, fromCol, toRow, toCol)` to open a cell and the wall between two orthogonally adjacent cells.

**PRNG** (`src/utils/random.ts`):
- `createRandom(seed?)` — returns a `() => number` in `[0, 1)`.
- `shuffle(arr, random)` — Fisher-Yates in-place shuffle.

### 3 — Register in the public API (`src/index.ts`)

Add an import and an entry to the `GENERATORS` record:

```typescript
import { MyAlgoGenerator } from './algorithms/my-algo';

const GENERATORS: Record<Algorithm, IMazeGenerator> = {
  [Algorithm.DFS]:      new DFSGenerator(),
  [Algorithm.PRIMS]:    new PrimsGenerator(),
  [Algorithm.KRUSKALS]: new KruskalsGenerator(),
  [Algorithm.MY_ALGO]:  new MyAlgoGenerator(),   // ← add this
};
```

### 4 — Write tests (`tests/<name>.test.ts`)

Import only from the public API (`../src/index`). Use the `isFullyConnected` helper from `../tests/helpers.ts`.

**Minimum test surface:**
- Matrix dimensions are `(2H+1) × (2W+1)`.
- All cells reachable (`isFullyConnected`).
- Deterministic output for the same seed.
- Works with non-square mazes (e.g. 5×10, 10×5).

```typescript
import { describe, it, expect } from 'vitest';
import { generateMaze, Algorithm } from '../src/index';
import { isFullyConnected } from './helpers';

describe('MyAlgo', () => {
  it('produces correct matrix dimensions', () => {
    const m = generateMaze({ width: 5, height: 7, algorithm: Algorithm.MY_ALGO });
    expect(m).toHaveLength(15);       // 2*7+1
    expect(m[0]).toHaveLength(11);    // 2*5+1
  });

  it('generates a fully connected maze', () => {
    const m = generateMaze({ width: 10, height: 10, algorithm: Algorithm.MY_ALGO });
    expect(isFullyConnected(m, 10, 10)).toBe(true);
  });

  it('is deterministic for a given seed', () => {
    const a = generateMaze({ width: 8, height: 8, algorithm: Algorithm.MY_ALGO, seed: 42 });
    const b = generateMaze({ width: 8, height: 8, algorithm: Algorithm.MY_ALGO, seed: 42 });
    expect(a).toEqual(b);
  });
});
```

### 5 — Add a sandbox demo card (`sandbox/index.html`)

Copy one of the existing `<section class="card">` blocks and update `data-algo`, `<h2>`, and `<p>`. The `sandbox/demo.ts` script auto-discovers cards via `querySelectorAll('.card[data-algo]')` — **no changes to `sandbox/demo.ts` are needed**.

```html
<section class="card" data-algo="my-algo">
  <h2>My Algorithm</h2>
  <p>Short description. Key characteristic. O(…) time.</p>
  <div class="controls">
    <label>W <input type="number" class="w-input" value="15" min="2" max="50" /></label>
    <label>H <input type="number" class="h-input" value="15" min="2" max="50" /></label>
    <button class="regen-btn">Regenerate</button>
  </div>
  <div class="maze-wrap"><div class="maze"></div></div>
</section>
```

The `data-algo` value must match the enum string value added in Step 1.

### 6 — Register in compare page (`sandbox/compare.ts`)

Add a new entry to the `ALGORITHMS` list so the algorithm appears in the comparison legend and overlay.

```typescript
const ALGORITHMS: AlgorithmDef[] = [
  { algo: Algorithm.DFS, label: 'Depth-First Search', color: '#ef4444' },
  // ...existing entries...
  { algo: Algorithm.MY_ALGO, label: 'My Algorithm', color: '#10b981' }, // ← add this
];
```

Notes:
- Keep labels human-readable and consistent with the sandbox demo card title.
- Choose a distinct color for readability in overlap mode.
- No `sandbox/compare.html` structural changes are required for normal algorithm additions.

### 7 — Verify

```bash
pnpm test          # all tests must pass
pnpm build         # library must build without type errors
```

---

## Architecture constraints

- **No framework imports.** Never import `document`, `window`, `canvas`, `React`, `Vue`, or any HTML/CSS. Core files are `src/` only.
- **No side effects** at module level.
- **No `any` or `unknown`** types. Be explicit everywhere.
- **Pure functions** wherever possible. Encapsulate state inside the class method.
- **Document Big O.** Every algorithm class must have a JSDoc comment with time and space complexity.
- **Zero runtime dependencies.** Do not add packages to `dependencies` in `package.json`.

---

## Implementation checklist

Before finishing, verify:

- [ ] `Algorithm.<MEMBER>` added to enum in `src/types.ts`
- [ ] `src/algorithms/<name>.ts` exists and exports a class implementing `IMazeGenerator`
- [ ] Class imported and added to `GENERATORS` in `src/index.ts`
- [ ] Tests written in `tests/<name>.test.ts` — dimensions, connectivity, determinism
- [ ] Demo card added to `sandbox/index.html` with matching `data-algo` value
- [ ] Algorithm added to `ALGORITHMS` in `sandbox/compare.ts` (algo, label, color)
- [ ] `pnpm test` passes
- [ ] `pnpm build` passes with no type errors
