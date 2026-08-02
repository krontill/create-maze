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
  CellularAutomatonRule,
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
import { CellularAutomatonGenerator } from './algorithms/cellular-automaton';
import { matrixToGraph } from './utils/graph';
import {
  ALGORITHM_CATALOG,
  ALGORITHM_VALUES,
  ALGORITHM_VARIANTS,
  CELLULAR_AUTOMATON_RULE_VALUES,
  FORMAT_VALUES,
  FRACTAL_MODE_VALUES,
  ROOMS_CONNECTION_MODE_VALUES,
  VORONOI_PRESET_VALUES,
  isAlgorithm,
  isCellularAutomatonRule,
  isFormat,
  isFractalMode,
  isRoomsConnectionMode,
  isVoronoiPreset,
  parseAlgorithm,
} from './metadata/algorithms';

// Re-export enums (values) and types (types only)
export { Algorithm, Format };
export type {
  CellularAutomatonRule,
  FractalMode,
  RoomsConnectionMode,
  VoronoiPreset,
  MazeConfig,
  MazeMatrix,
  MazeGraph,
  IMazeGenerator,
};
export type { GraphNode } from './types';
export {
  ALGORITHM_VALUES,
  FORMAT_VALUES,
  FRACTAL_MODE_VALUES,
  ROOMS_CONNECTION_MODE_VALUES,
  VORONOI_PRESET_VALUES,
  CELLULAR_AUTOMATON_RULE_VALUES,
  isAlgorithm,
  isFormat,
  isFractalMode,
  isRoomsConnectionMode,
  isVoronoiPreset,
  isCellularAutomatonRule,
  parseAlgorithm,
  ALGORITHM_CATALOG,
  ALGORITHM_VARIANTS,
};
export type { AlgorithmCatalogEntry, AlgorithmVariant } from './metadata/algorithms';

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
  [Algorithm.CELLULAR_AUTOMATON]: new CellularAutomatonGenerator(),
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
  if (!isAlgorithm(String(config.algorithm))) {
    throw new TypeError(
      `MazeConfig.algorithm must be one of [${ALGORITHM_VALUES.join(', ')}], got "${config.algorithm}"`,
    );
  }
  if (config.format !== undefined) {
    if (!isFormat(String(config.format))) {
      throw new TypeError(
        `MazeConfig.format must be one of [${FORMAT_VALUES.join(', ')}], got "${config.format}"`,
      );
    }
  }
  if (config.seed !== undefined && !Number.isFinite(config.seed)) {
    throw new TypeError(
      `MazeConfig.seed must be a finite number, got ${config.seed}`,
    );
  }
  if (config.fractalMode !== undefined && !isFractalMode(String(config.fractalMode))) {
    throw new TypeError(
      `MazeConfig.fractalMode must be one of [${FRACTAL_MODE_VALUES.join(', ')}], got "${config.fractalMode}"`,
    );
  }
  if (
    config.roomsConnectionMode !== undefined &&
    !isRoomsConnectionMode(String(config.roomsConnectionMode))
  ) {
    throw new TypeError(
      `MazeConfig.roomsConnectionMode must be one of [${ROOMS_CONNECTION_MODE_VALUES.join(', ')}], got "${config.roomsConnectionMode}"`,
    );
  }
  if (config.voronoiPreset !== undefined && !isVoronoiPreset(String(config.voronoiPreset))) {
    throw new TypeError(
      `MazeConfig.voronoiPreset must be one of [${VORONOI_PRESET_VALUES.join(', ')}], got "${config.voronoiPreset}"`,
    );
  }
  if (
    config.caFillRatio !== undefined &&
    (!Number.isFinite(config.caFillRatio) || config.caFillRatio <= 0 || config.caFillRatio >= 1)
  ) {
    throw new RangeError(
      `MazeConfig.caFillRatio must be a number in the range (0, 1), got ${config.caFillRatio}`,
    );
  }
  if (
    config.caGenerations !== undefined &&
    (!Number.isInteger(config.caGenerations) || config.caGenerations < 1)
  ) {
    throw new RangeError(
      `MazeConfig.caGenerations must be a positive integer, got ${config.caGenerations}`,
    );
  }
  if (config.caRule !== undefined && !isCellularAutomatonRule(String(config.caRule))) {
    throw new TypeError(
      `MazeConfig.caRule must be one of [${CELLULAR_AUTOMATON_RULE_VALUES.join(', ')}], got "${config.caRule}"`,
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

/**
 * Generates a maze and returns an ordered array of intermediate snapshots —
 * one per meaningful carving step — so callers can animate the algorithm.
 *
 * The last snapshot is identical to the result of
 * {@link generateMaze} called with the same config (matrix format).
 * The `format` field of `config` is ignored; snapshots are always
 * {@link MazeMatrix} instances.
 *
 * @param config - Maze configuration. Same validation rules as generateMaze().
 * @returns Ordered array of MazeMatrix snapshots, earliest first.
 *
 * @example
 * ```ts
 * const frames = generateMazeSteps({ width: 10, height: 10, algorithm: Algorithm.DFS });
 * console.log(`${frames.length} steps`);
 * // animate frames[0], frames[1], …, frames[frames.length - 1]
 * ```
 */
export function generateMazeSteps(config: MazeConfig): MazeMatrix[] {
  validateConfig(config);
  return GENERATORS[config.algorithm].steps(config);
}
