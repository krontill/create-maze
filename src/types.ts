/**
 * Core types and interfaces for maze-builder.
 *
 * All public API types are exported from here and re-exported via src/index.ts.
 * Zero runtime dependencies — pure TypeScript definitions only.
 */

/** Supported maze-generation algorithms. */
export enum Algorithm {
  DFS = 'dfs',
  PRIMS = 'prims',
  KRUSKALS = 'kruskals',
  BINARY_TREE = 'binary-tree',
  WILSONS = 'wilsons',
  ALDOUS_BRODER = 'aldous-broder',
}

/** Supported output formats. */
export enum Format {
  MATRIX = 'matrix',
  GRAPH = 'graph',
}

/**
 * Configuration object passed to every maze generator.
 * All algorithms respect the same contract.
 */
export interface MazeConfig {
  /** Number of cells wide (must be a positive integer ≥ 1). */
  width: number;
  /** Number of cells tall (must be a positive integer ≥ 1). */
  height: number;
  /** Which generation algorithm to use. */
  algorithm: Algorithm;
  /**
   * Desired output format.
   * @defaultValue Format.MATRIX
   */
  format?: Format;
  /**
   * Optional seed for the PRNG. Supplying the same seed for the same
   * width/height/algorithm always produces an identical maze.
   */
  seed?: number;
}

/**
 * A 2-D numeric grid: 0 = wall, 1 = passage.
 * Dimensions are (2 × height + 1) rows × (2 × width + 1) columns.
 */
export type MazeMatrix = number[][];

/**
 * A single node in the graph representation of a maze.
 */
export interface GraphNode {
  /** Unique identifier: row × width + col. */
  id: number;
  /** Column index of the cell (0-based). */
  x: number;
  /** Row index of the cell (0-based). */
  y: number;
  /** IDs of directly reachable (passage-connected) neighbouring cells. */
  neighbors: number[];
}

/** Graph representation: one node per maze cell, ordered row-major. */
export type MazeGraph = GraphNode[];

/**
 * Contract that every maze-generation algorithm must fulfil.
 * Algorithms always produce an internal MazeMatrix; format conversion
 * happens in the public API layer.
 */
export interface IMazeGenerator {
  /**
   * Generate a maze and return it as a matrix.
   * @param config - Validated maze configuration.
   * @returns A MazeMatrix where 0 = wall and 1 = passage.
   */
  generate(config: MazeConfig): MazeMatrix;
}
