# maze-builder

Framework-agnostic, pure TypeScript maze generation library. Zero runtime dependencies. Dual ESM/CJS output with `.d.ts` declarations.

## Installation

```sh
npm install maze-builder
# or
yarn add maze-builder
```

## Quick Start

```ts
import { generateMaze, Algorithm } from 'maze-builder';

// 10×10 maze using DFS — returns a (2H+1)×(2W+1) numeric matrix
// 0 = wall, 1 = passage
const maze = generateMaze({ width: 10, height: 10, algorithm: Algorithm.DFS });

// Reproducible output with a seed
const seeded = generateMaze({ width: 10, height: 10, algorithm: Algorithm.DFS, seed: 42 });

// Graph adjacency-list format
import { Format } from 'maze-builder';
const graph = generateMaze({ width: 5, height: 5, algorithm: Algorithm.PRIMS, format: Format.GRAPH });
// graph[0] → { id: 0, x: 0, y: 0, neighbors: [1, 5, ...] }
```

## API

### `generateMaze(config: MazeConfig): MazeMatrix | MazeGraph`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `width` | `number` | ✓ | Cells wide (positive integer) |
| `height` | `number` | ✓ | Cells tall (positive integer) |
| `algorithm` | `Algorithm` | ✓ | Generation algorithm |
| `format` | `Format` | — | Output format (default: `MATRIX`) |
| `seed` | `number` | — | PRNG seed for reproducibility |
| `fractalMode` | `'tile-substitution' \| 'quadtree-division'` | — | Fractal Tessellation mode (default: `'tile-substitution'`) |
| `roomsConnectionMode` | `'manhattan-l' \| 'random-walk' \| 'nearest-mst'` | — | Rooms & Corridors connector strategy (default: `'manhattan-l'`) |
| `voronoiPreset` | `'natural' \| 'structured'` | — | Voronoi Diagram preset (default: `'natural'`) |
| `caFillRatio` | `number` | — | Cellular Automaton initial alive-cell fill ratio in `(0, 1)` (default: `0.45`) |
| `caGenerations` | `number` | — | Cellular Automaton generation count, positive integer (default: `4`) |
| `caRule` | `'b5s45' \| 'maze' \| 'mazectric'` | — | Cellular Automaton rule preset (default: `'b5s45'`) |

### `generateMazeSteps(config: MazeConfig): MazeMatrix[]`

Returns ordered intermediate matrix snapshots for animation/progression use-cases.
The last snapshot equals `generateMaze(config)` in matrix format.

### Algorithms

| Value | Description | Time | Space |
|-------|-------------|------|-------|
| `Algorithm.DFS` | Iterative Depth-First Search (Recursive Backtracker) | O(W×H) | O(W×H) |
| `Algorithm.PRIMS` | Randomised Prim's | O(W×H) | O(W×H) |
| `Algorithm.KRUSKALS` | Randomised Kruskal's (Union-Find) | O(W×H·α(W×H)) | O(W×H) |
| `Algorithm.BINARY_TREE` | Binary Tree maze generation | O(W×H) | O(W×H) |
| `Algorithm.WILSONS` | Wilson's algorithm | O(W×H) | O(W×H) |
| `Algorithm.ALDOUS_BRODER` | Aldous-Broder random walk | O(W×H) | O(W×H) |
| `Algorithm.ELLERS` | Eller’s algorithm | O(W×H) | O(W) |
| `Algorithm.SIDEWINDER` | Sidewinder algorithm | O(W×H) | O(W) |
| `Algorithm.HUNT_AND_KILL` | Hunt-and-kill algorithm | O(W×H) | O(W×H) |
| `Algorithm.RECURSIVE_DIVISION` | Recursive division | O(W×H) | O(W×H) |
| `Algorithm.GROWING_TREE` | Growing Tree algorithm | O(W×H) | O(W×H) |
| `Algorithm.HOUSTONS` | Houston's algorithm | O(W×H) | O(W×H) |
| `Algorithm.TREMAUX` | Trémaux-inspired exploration/backtracking | O(W×H) | O(W×H) |
| `Algorithm.SPIRAL_BACKTRACKER` | DFS variant with clockwise turning preference, producing spiral-heavy local structure | O(W×H) | O(W×H) |
| `Algorithm.SPANNING_TREE_BFS` | BFS frontier spanning tree, producing shorter/wider paths and shallow dead ends | O(W×H) | O(W×H) |
| `Algorithm.FRACTAL_TESSELLATION` | Fractal Tessellation (tile/quadtree modes) | O(W×H) | O(W×H) |
| `Algorithm.ROOMS_AND_CORRIDORS` | Room placement with corridor connectors | O(W×H + R²) | O(W×H + R²) |
| `Algorithm.VORONOI_DIAGRAM` | Voronoi regions + spanning connectors (natural/structured presets) | O(W×H×S) | O(W×H + S) |
| `Algorithm.CELLULAR_AUTOMATON` | Cellular automaton cave generation with connectivity repair | O(G×W×H) | O(W×H) |

### Output Formats

- **`Format.MATRIX`** (default) - `number[][]` grid of size `(2H+1)×(2W+1)`. `0` = wall, `1` = passage. Entry opens at `grid[1][0]`; exit at `grid[2H-1][2W]`.
- **`Format.GRAPH`** - `GraphNode[]` adjacency list. Each node: `{ id, x, y, neighbors }`.

## Development

```sh
yarn install        # install dev dependencies
yarn test           # vitest watch mode
yarn test:run       # single test run
yarn test:coverage  # coverage report
yarn typecheck      # tsc --noEmit
yarn build          # Vite library build → dist/
```

## Demo Pages

- `/index.html` - algorithm gallery with per-algorithm maze cards
- `/compare.html` - overlap comparison across selected algorithms
- `/visualizer.html` - step-by-step generation snapshots
- `/formats.html` - one seeded maze rendered in both `Format.MATRIX` and `Format.GRAPH`

## License

MIT
