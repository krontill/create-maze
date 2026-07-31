import { describe, it, expect } from 'vitest';
import { Algorithm } from '../src';
import { matrixToGraph } from '../src/utils/graph';
import type { MazeGraph } from '../src';
import { buildFormatsPreview, buildGraphLinks } from '../sandbox/formats-shared';

describe('buildFormatsPreview', () => {
  it('returns matrix and graph views for same seeded maze', () => {
    const config = { width: 4, height: 3, algorithm: Algorithm.DFS, seed: 12 };
    const preview = buildFormatsPreview(config);

    expect(preview.matrix).toEqual(preview.matrixFromFormat);
    expect(preview.graph).toEqual(matrixToGraph(preview.matrix, config.width, config.height));
    expect(preview.graphFromFormat).toEqual(preview.graph);
    expect(preview.matrixText).toContain('[\n');
    expect(preview.graphText).toContain('"neighbors"');
  });
});

describe('buildGraphLinks', () => {
  it('returns each undirected graph edge once', () => {
    const graph: MazeGraph = [
      { id: 0, x: 0, y: 0, neighbors: [1, 2] },
      { id: 1, x: 1, y: 0, neighbors: [0, 3] },
      { id: 2, x: 0, y: 1, neighbors: [0] },
      { id: 3, x: 1, y: 1, neighbors: [1] },
    ];

    expect(buildGraphLinks(graph)).toEqual([
      { sourceId: 0, targetId: 1 },
      { sourceId: 0, targetId: 2 },
      { sourceId: 1, targetId: 3 },
    ]);
  });
});
