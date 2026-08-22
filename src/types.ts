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
  ELLERS = 'ellers',
  SIDEWINDER = 'sidewinder',
  SPIRAL_BACKTRACKER = 'spiral-backtracker',
  HUNT_AND_KILL = 'hunt-and-kill',
  RECURSIVE_DIVISION = 'recursive-division',
  GROWING_TREE = 'growing-tree',
  HOUSTONS = 'houstons',
  TREMAUX = 'tremaux',
  FRACTAL_TESSELLATION = 'fractal-tessellation',
  VORONOI_DIAGRAM = 'voronoi-diagram',
  ROOMS_AND_CORRIDORS = 'rooms-and-corridors',
  SPANNING_TREE_BFS = 'spanning-tree-bfs',
  CELLULAR_AUTOMATON = 'cellular-automaton',
}

/** Fractal Tessellation generation modes. */
export type FractalMode = 'tile-substitution' | 'quadtree-division';

/** Rooms & Corridors room-center connection modes. */
export type RoomsConnectionMode = 'manhattan-l' | 'random-walk' | 'nearest-mst';

/** Voronoi Diagram regional layout presets. */
export type VoronoiPreset = 'natural' | 'structured' | 'border-doors' | 'border-doors-braided' | 'region-border-doors';

/** Cellular Automaton rule presets. */
export type CellularAutomatonRule = 'b5s45' | 'maze' | 'mazectric';

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
  /**
   * Optional mode used by Algorithm.FRACTAL_TESSELLATION.
   *
   * @defaultValue 'tile-substitution'
   */
  fractalMode?: FractalMode;
  /**
   * Optional room-center connection mode used by
   * Algorithm.ROOMS_AND_CORRIDORS.
   *
   * @defaultValue 'manhattan-l'
   */
  roomsConnectionMode?: RoomsConnectionMode;
  /**
   * Optional Voronoi style preset used by Algorithm.VORONOI_DIAGRAM.
   *
   * @defaultValue 'natural'
   */
  voronoiPreset?: VoronoiPreset;
  /**
   * Initial fill ratio for Algorithm.CELLULAR_AUTOMATON.
   * Controls the probability that each cell starts alive.
   * Must be in the range (0, 1).
   *
   * @defaultValue 0.45
   */
  caFillRatio?: number;
  /**
   * Number of CA simulation generations for Algorithm.CELLULAR_AUTOMATON.
   * Higher values produce larger, smoother caves; lower values produce
   * noisier, more fragmented passages.
   * Must be a positive integer.
   *
   * @defaultValue 4
   */
  caGenerations?: number;
  /**
   * Cellular Automaton rule preset used by Algorithm.CELLULAR_AUTOMATON.
   *
   * - 'b5s45'      = dead cell born with >= 5 neighbors; live cell survives with >= 4
   * - 'maze'       = B3/S12345
   * - 'mazectric'  = B3/S1234
   *
   * @defaultValue 'b5s45'
   */
  caRule?: CellularAutomatonRule;
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

  /**
   * Generate a maze and return an ordered array of intermediate snapshots,
   * one per meaningful carving step. The last snapshot is identical to the
   * result of `generate()`. The `format` field of config is ignored — all
   * snapshots are always MazeMatrix instances.
   *
   * @param config - Validated maze configuration.
   * @returns Array of MazeMatrix snapshots, earliest first.
   */
  steps(config: MazeConfig): MazeMatrix[];
}
