/**
 * Public API for maze-builder.
 *
 * All public types and the generateMaze() function are exported from here.
 * Internal utilities and algorithm classes are not part of the public API.
 *
 * @module maze-builder
 */

import { Algorithm, Format } from './types';
import type {
  FractalMode,
  RoomsConnectionMode,
  VoronoiPreset,
  MazeConfig,
  MazeMatrix,
  MazeGraph,
  IMazeGenerator,
} from './types';
import { DFSGenerator } from './algorithms/dfs';
import { PrimsGenerator } from './algorithms/prims';
import { KruskalsGenerator } from './algorithms/kruskals';
import { BinaryTreeGenerator } from './algorithms/binary-tree';
import { WilsonsGenerator } from './algorithms/wilsons';
import { AldousBroderGenerator } from './algorithms/aldous-broder';
import { EllersGenerator } from './algorithms/ellers';
import { SidewinderGenerator } from './algorithms/sidewinder';
import { SpiralBacktrackerGenerator } from './algorithms/spiral-backtracker';
import { HuntAndKillGenerator } from './algorithms/hunt-and-kill';
import { RecursiveDivisionGenerator } from './algorithms/recursive-division';
import { GrowingTreeGenerator } from './algorithms/growing-tree';
import { HoustonsGenerator } from './algorithms/houstons';
import { TremauxGenerator } from './algorithms/tremaux';
import { FractalTessellationGenerator } from './algorithms/fractal-tessellation';
import { VoronoiDiagramGenerator } from './algorithms/voronoi-diagram';
import { RoomsAndCorridorsGenerator } from './algorithms/rooms-and-corridors';
import { SpanningTreeBFSGenerator } from './algorithms/spanning-tree-bfs';
import { matrixToGraph } from './utils/graph';

// Re-export enums (values) and types (types only)
export { Algorithm, Format };
export type {
  FractalMode,
  RoomsConnectionMode,
  VoronoiPreset,
  MazeConfig,
  MazeMatrix,
  MazeGraph,
  IMazeGenerator,
};
export type { GraphNode } from './types';

// ---------------------------------------------------------------------------
// Algorithm registry
// ---------------------------------------------------------------------------

const GENERATORS: Record<Algorithm, IMazeGenerator> = {
  [Algorithm.DFS]: new DFSGenerator(),
  [Algorithm.PRIMS]: new PrimsGenerator(),
  [Algorithm.KRUSKALS]: new KruskalsGenerator(),
  [Algorithm.BINARY_TREE]: new BinaryTreeGenerator(),
  [Algorithm.WILSONS]: new WilsonsGenerator(),
  [Algorithm.ALDOUS_BRODER]: new AldousBroderGenerator(),
  [Algorithm.ELLERS]: new EllersGenerator(),
  [Algorithm.SIDEWINDER]: new SidewinderGenerator(),
  [Algorithm.SPIRAL_BACKTRACKER]: new SpiralBacktrackerGenerator(),
  [Algorithm.HUNT_AND_KILL]: new HuntAndKillGenerator(),
  [Algorithm.RECURSIVE_DIVISION]: new RecursiveDivisionGenerator(),
  [Algorithm.GROWING_TREE]: new GrowingTreeGenerator(),
  [Algorithm.HOUSTONS]: new HoustonsGenerator(),
  [Algorithm.TREMAUX]: new TremauxGenerator(),
  [Algorithm.FRACTAL_TESSELLATION]: new FractalTessellationGenerator(),
  [Algorithm.VORONOI_DIAGRAM]: new VoronoiDiagramGenerator(),
  [Algorithm.ROOMS_AND_CORRIDORS]: new RoomsAndCorridorsGenerator(),
  [Algorithm.SPANNING_TREE_BFS]: new SpanningTreeBFSGenerator(),
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validates a MazeConfig at the public API boundary.
 *
 * @throws {RangeError}  if width or height are not positive integers.
 * @throws {TypeError}   if algorithm or format values are unrecognised.
 */
function validateConfig(config: MazeConfig): void {
  if (!Number.isInteger(config.width) || config.width < 1) {
    throw new RangeError(
      `MazeConfig.width must be a positive integer, got ${config.width}`,
    );
  }
  if (!Number.isInteger(config.height) || config.height < 1) {
    throw new RangeError(
      `MazeConfig.height must be a positive integer, got ${config.height}`,
    );
  }
  const validAlgorithms = Object.values(Algorithm) as string[];
  if (!validAlgorithms.includes(config.algorithm as string)) {
    throw new TypeError(
      `MazeConfig.algorithm must be one of [${validAlgorithms.join(', ')}], got "${config.algorithm}"`,
    );
  }
  if (config.format !== undefined) {
    const validFormats = Object.values(Format) as string[];
    if (!validFormats.includes(config.format as string)) {
      throw new TypeError(
        `MazeConfig.format must be one of [${validFormats.join(', ')}], got "${config.format}"`,
      );
    }
  }
  if (config.seed !== undefined && !Number.isFinite(config.seed)) {
    throw new TypeError(
      `MazeConfig.seed must be a finite number, got ${config.seed}`,
    );
  }
  if (
    config.fractalMode !== undefined &&
    config.fractalMode !== 'tile-substitution' &&
    config.fractalMode !== 'quadtree-division'
  ) {
    throw new TypeError(
      `MazeConfig.fractalMode must be one of [tile-substitution, quadtree-division], got "${config.fractalMode}"`,
    );
  }
  if (
    config.roomsConnectionMode !== undefined &&
    config.roomsConnectionMode !== 'manhattan-l' &&
    config.roomsConnectionMode !== 'random-walk' &&
    config.roomsConnectionMode !== 'nearest-mst'
  ) {
    throw new TypeError(
      `MazeConfig.roomsConnectionMode must be one of [manhattan-l, random-walk, nearest-mst], got "${config.roomsConnectionMode}"`,
    );
  }
  if (
    config.voronoiPreset !== undefined &&
    config.voronoiPreset !== 'natural' &&
    config.voronoiPreset !== 'structured'
  ) {
    throw new TypeError(
      `MazeConfig.voronoiPreset must be one of [natural, structured], got "${config.voronoiPreset}"`,
    );
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a maze and returns it as a {@link MazeGraph}.
 *
 * @param config - Maze configuration with `format: Format.GRAPH`.
 * @returns An adjacency-list graph where each node represents one maze cell.
 */
export function generateMaze(config: MazeConfig & { format: Format.GRAPH }): MazeGraph;

/**
 * Generates a maze and returns it as a {@link MazeMatrix}.
 *
 * @param config - Maze configuration (format is MATRIX or omitted).
 * @returns A `(2H+1) × (2W+1)` numeric matrix where 0 = wall, 1 = passage.
 *
 * @example
 * ```ts
 * import { generateMaze, Algorithm } from 'maze-builder';
 *
 * const maze = generateMaze({ width: 10, height: 10, algorithm: Algorithm.DFS });
 * // maze[1][0] === 1  ← entry opening
 * ```
 */
export function generateMaze(config: MazeConfig & { format?: Format.MATRIX }): MazeMatrix;

export function generateMaze(config: MazeConfig): MazeMatrix | MazeGraph {
  validateConfig(config);
  const generator = GENERATORS[config.algorithm];
  const matrix = generator.generate(config);

  if (config.format === Format.GRAPH) {
    return matrixToGraph(matrix, config.width, config.height);
  }

  return matrix;
}
