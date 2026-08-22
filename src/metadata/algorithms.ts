import { Algorithm, Format } from '../types';
import type {
  CellularAutomatonRule,
  FractalMode,
  RoomsConnectionMode,
  VoronoiPreset,
} from '../types';

export const ALGORITHM_VALUES: readonly Algorithm[] = [
  Algorithm.DFS,
  Algorithm.PRIMS,
  Algorithm.KRUSKALS,
  Algorithm.BINARY_TREE,
  Algorithm.WILSONS,
  Algorithm.ALDOUS_BRODER,
  Algorithm.ELLERS,
  Algorithm.SIDEWINDER,
  Algorithm.SPIRAL_BACKTRACKER,
  Algorithm.HUNT_AND_KILL,
  Algorithm.RECURSIVE_DIVISION,
  Algorithm.GROWING_TREE,
  Algorithm.HOUSTONS,
  Algorithm.TREMAUX,
  Algorithm.FRACTAL_TESSELLATION,
  Algorithm.ROOMS_AND_CORRIDORS,
  Algorithm.VORONOI_DIAGRAM,
  Algorithm.SPANNING_TREE_BFS,
  Algorithm.CELLULAR_AUTOMATON,
];

export const FORMAT_VALUES: readonly Format[] = [
  Format.MATRIX,
  Format.GRAPH,
];

export const FRACTAL_MODE_VALUES: readonly FractalMode[] = [
  'tile-substitution',
  'quadtree-division',
];

export const ROOMS_CONNECTION_MODE_VALUES: readonly RoomsConnectionMode[] = [
  'manhattan-l',
  'random-walk',
  'nearest-mst',
];

export const VORONOI_PRESET_VALUES: readonly VoronoiPreset[] = [
  'natural',
  'structured',
  'border-doors',
  'border-doors-braided',
  'region-border-doors',
];

export const CELLULAR_AUTOMATON_RULE_VALUES: readonly CellularAutomatonRule[] = [
  'b5s45',
  'maze',
  'mazectric',
];

export interface AlgorithmCatalogEntry {
  algorithm: Algorithm;
  label: string;
}

export const ALGORITHM_CATALOG: readonly AlgorithmCatalogEntry[] = [
  { algorithm: Algorithm.DFS, label: 'Depth-First Search' },
  { algorithm: Algorithm.PRIMS, label: "Prim's" },
  { algorithm: Algorithm.KRUSKALS, label: "Kruskal's" },
  { algorithm: Algorithm.BINARY_TREE, label: 'Binary Tree' },
  { algorithm: Algorithm.WILSONS, label: "Wilson's" },
  { algorithm: Algorithm.ALDOUS_BRODER, label: 'Aldous-Broder' },
  { algorithm: Algorithm.ELLERS, label: "Eller's" },
  { algorithm: Algorithm.SIDEWINDER, label: 'Sidewinder' },
  { algorithm: Algorithm.SPIRAL_BACKTRACKER, label: 'Spiral Backtracker' },
  { algorithm: Algorithm.HUNT_AND_KILL, label: 'Hunt-and-Kill' },
  { algorithm: Algorithm.RECURSIVE_DIVISION, label: 'Recursive Division' },
  { algorithm: Algorithm.GROWING_TREE, label: 'Growing Tree' },
  { algorithm: Algorithm.HOUSTONS, label: "Houston's" },
  { algorithm: Algorithm.TREMAUX, label: 'Trémaux' },
  { algorithm: Algorithm.FRACTAL_TESSELLATION, label: 'Fractal Tessellation' },
  { algorithm: Algorithm.ROOMS_AND_CORRIDORS, label: 'Rooms & Corridors' },
  { algorithm: Algorithm.VORONOI_DIAGRAM, label: 'Voronoi Diagram' },
  { algorithm: Algorithm.SPANNING_TREE_BFS, label: 'Spanning Tree BFS' },
  { algorithm: Algorithm.CELLULAR_AUTOMATON, label: 'Cellular Automaton' },
];

export interface AlgorithmVariant {
  key: string;
  label: string;
  algorithm: Algorithm;
  seed?: number;
  fractalMode?: FractalMode;
  roomsConnectionMode?: RoomsConnectionMode;
  voronoiPreset?: VoronoiPreset;
  caRule?: CellularAutomatonRule;
}

export const ALGORITHM_VARIANTS: readonly AlgorithmVariant[] = [
  { key: 'dfs', label: 'Depth-First Search', algorithm: Algorithm.DFS },
  { key: 'prims', label: "Prim's", algorithm: Algorithm.PRIMS },
  { key: 'kruskals', label: "Kruskal's", algorithm: Algorithm.KRUSKALS },
  { key: 'binary-tree', label: 'Binary Tree', algorithm: Algorithm.BINARY_TREE },
  { key: 'wilsons', label: "Wilson's", algorithm: Algorithm.WILSONS },
  { key: 'aldous-broder', label: 'Aldous-Broder', algorithm: Algorithm.ALDOUS_BRODER },
  { key: 'ellers', label: "Eller's", algorithm: Algorithm.ELLERS },
  { key: 'sidewinder', label: 'Sidewinder', algorithm: Algorithm.SIDEWINDER },
  { key: 'spiral-backtracker-0', label: 'Spiral Backtracker (seed 0)', algorithm: Algorithm.SPIRAL_BACKTRACKER, seed: 0 },
  { key: 'spiral-backtracker-1', label: 'Spiral Backtracker (seed 1)', algorithm: Algorithm.SPIRAL_BACKTRACKER, seed: 1 },
  { key: 'spiral-backtracker-2', label: 'Spiral Backtracker (seed 2)', algorithm: Algorithm.SPIRAL_BACKTRACKER, seed: 2 },
  { key: 'hunt-and-kill', label: 'Hunt-and-Kill', algorithm: Algorithm.HUNT_AND_KILL },
  { key: 'recursive-division', label: 'Recursive Division', algorithm: Algorithm.RECURSIVE_DIVISION },
  { key: 'fractal-tessellation-tile-substitution', label: 'Fractal Tessellation (Tile Substitution)', algorithm: Algorithm.FRACTAL_TESSELLATION, fractalMode: 'tile-substitution' },
  { key: 'fractal-tessellation-quadtree-division', label: 'Fractal Tessellation (Quadtree Division)', algorithm: Algorithm.FRACTAL_TESSELLATION, fractalMode: 'quadtree-division' },
  { key: 'voronoi-diagram-natural', label: 'Voronoi Diagram (Natural)', algorithm: Algorithm.VORONOI_DIAGRAM, voronoiPreset: 'natural' },
  { key: 'voronoi-diagram-structured', label: 'Voronoi Diagram (Structured)', algorithm: Algorithm.VORONOI_DIAGRAM, voronoiPreset: 'structured' },
  { key: 'voronoi-diagram-border-doors', label: 'Voronoi Diagram (Border Doors - Balanced)', algorithm: Algorithm.VORONOI_DIAGRAM, voronoiPreset: 'border-doors' },
  { key: 'voronoi-diagram-border-doors-braided', label: 'Voronoi Diagram (Border Doors - Braided)', algorithm: Algorithm.VORONOI_DIAGRAM, voronoiPreset: 'border-doors-braided' },
  { key: 'voronoi-diagram-region-border-doors', label: 'Voronoi Diagram (Region Border Doors)', algorithm: Algorithm.VORONOI_DIAGRAM, voronoiPreset: 'region-border-doors' },
  { key: 'rooms-and-corridors-manhattan-l', label: 'Rooms & Corridors (Manhattan-L)', algorithm: Algorithm.ROOMS_AND_CORRIDORS, roomsConnectionMode: 'manhattan-l' },
  { key: 'rooms-and-corridors-random-walk', label: 'Rooms & Corridors (Random Walk)', algorithm: Algorithm.ROOMS_AND_CORRIDORS, roomsConnectionMode: 'random-walk' },
  { key: 'rooms-and-corridors-nearest-mst', label: 'Rooms & Corridors (Nearest MST)', algorithm: Algorithm.ROOMS_AND_CORRIDORS, roomsConnectionMode: 'nearest-mst' },
  { key: 'growing-tree', label: 'Growing Tree', algorithm: Algorithm.GROWING_TREE },
  { key: 'houstons', label: "Houston's", algorithm: Algorithm.HOUSTONS },
  { key: 'tremaux', label: 'Tremaux', algorithm: Algorithm.TREMAUX },
  { key: 'spanning-tree-bfs', label: 'Spanning Tree (BFS)', algorithm: Algorithm.SPANNING_TREE_BFS },
  { key: 'cellular-automaton-b5s45', label: 'Cellular Automaton (B5/S45)', algorithm: Algorithm.CELLULAR_AUTOMATON, caRule: 'b5s45' },
  { key: 'cellular-automaton-maze', label: 'Maze (B3/S12345)', algorithm: Algorithm.CELLULAR_AUTOMATON, caRule: 'maze' },
  { key: 'cellular-automaton-mazectric', label: 'Mazectric (B3/S1234)', algorithm: Algorithm.CELLULAR_AUTOMATON, caRule: 'mazectric' },
];

const ALGORITHM_SET: ReadonlySet<string> = new Set(ALGORITHM_VALUES);
const FORMAT_SET: ReadonlySet<string> = new Set(FORMAT_VALUES);
const FRACTAL_MODE_SET: ReadonlySet<string> = new Set(FRACTAL_MODE_VALUES);
const ROOMS_CONNECTION_MODE_SET: ReadonlySet<string> = new Set(ROOMS_CONNECTION_MODE_VALUES);
const VORONOI_PRESET_SET: ReadonlySet<string> = new Set(VORONOI_PRESET_VALUES);
const CELLULAR_AUTOMATON_RULE_SET: ReadonlySet<string> = new Set(CELLULAR_AUTOMATON_RULE_VALUES);

export function isAlgorithm(value: string): value is Algorithm {
  return ALGORITHM_SET.has(value);
}

export function parseAlgorithm(value: string, fallback: Algorithm = Algorithm.DFS): Algorithm {
  return isAlgorithm(value) ? value : fallback;
}

export function isFormat(value: string): value is Format {
  return FORMAT_SET.has(value);
}

export function isFractalMode(value: string): value is FractalMode {
  return FRACTAL_MODE_SET.has(value);
}

export function isRoomsConnectionMode(value: string): value is RoomsConnectionMode {
  return ROOMS_CONNECTION_MODE_SET.has(value);
}

export function isVoronoiPreset(value: string): value is VoronoiPreset {
  return VORONOI_PRESET_SET.has(value);
}

export function isCellularAutomatonRule(value: string): value is CellularAutomatonRule {
  return CELLULAR_AUTOMATON_RULE_SET.has(value);
}
