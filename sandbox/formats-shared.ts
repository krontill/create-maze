import { generateMaze, Format } from '../src/index';
import type { MazeConfig, MazeGraph, MazeMatrix } from '../src/index';

export interface GraphLink {
  sourceId: number;
  targetId: number;
}

export interface FormatsPreview {
  matrix: MazeMatrix;
  graph: MazeGraph;
  matrixFromFormat: MazeMatrix;
  graphFromFormat: MazeGraph;
  graphLinks: GraphLink[];
  matrixText: string;
  graphText: string;
}

export type FormatsPreviewConfig = Omit<MazeConfig, 'format'>;

export function buildGraphLinks(graph: MazeGraph): GraphLink[] {
  const links: GraphLink[] = [];

  for (const node of graph) {
    for (const neighborId of node.neighbors) {
      if (neighborId > node.id) {
        links.push({
          sourceId: node.id,
          targetId: neighborId,
        });
      }
    }
  }

  return links;
}

export function formatMatrixText(matrix: MazeMatrix): string {
  return JSON.stringify(matrix, null, 2);
}

export function formatGraphText(graph: MazeGraph): string {
  return JSON.stringify(graph, null, 2);
}

export function buildFormatsPreview(config: FormatsPreviewConfig): FormatsPreview {
  const matrixFromFormat = generateMaze({
    ...config,
    format: Format.MATRIX,
  });
  const graphFromFormat = generateMaze({
    ...config,
    format: Format.GRAPH,
  });
  const matrix = matrixFromFormat;
  const graph = graphFromFormat;

  return {
    matrix,
    graph,
    matrixFromFormat,
    graphFromFormat,
    graphLinks: buildGraphLinks(graph),
    matrixText: formatMatrixText(matrixFromFormat),
    graphText: formatGraphText(graphFromFormat),
  };
}
