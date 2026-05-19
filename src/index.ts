/**
 * Public API for maze-builder.
 *
 * All public types and the generateMaze() function are exported from here.
 * Internal utilities and algorithm classes are not part of the public API.
 *
 * @module maze-builder
 */

import { Algorithm, Format } from './types';
import type { MazeConfig, MazeMatrix, MazeGraph, IMazeGenerator } from './types';
import { DFSGenerator } from './algorithms/dfs';
import { PrimsGenerator } from './algorithms/prims';
import { KruskalsGenerator } from './algorithms/kruskals';
import { matrixToGraph } from './utils/graph';

// Re-export enums (values) and types (types only)
export { Algorithm, Format };
export type { MazeConfig, MazeMatrix, MazeGraph, IMazeGenerator };
export type { GraphNode } from './types';

// ---------------------------------------------------------------------------
// Algorithm registry
// ---------------------------------------------------------------------------

const GENERATORS: Record<Algorithm, IMazeGenerator> = {
  [Algorithm.DFS]: new DFSGenerator(),
  [Algorithm.PRIMS]: new PrimsGenerator(),
  [Algorithm.KRUSKALS]: new KruskalsGenerator(),
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
