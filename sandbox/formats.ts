import { Algorithm } from '../src/index';
import type {
  CellularAutomatonRule,
  FractalMode,
  RoomsConnectionMode,
  VoronoiPreset,
} from '../src/index';
import { buildFormatsPreview } from './formats-shared';

const CELL_PX = 12;

const algorithmInput = document.getElementById('algorithm-input') as HTMLSelectElement;
const widthInput = document.getElementById('width-input') as HTMLInputElement;
const heightInput = document.getElementById('height-input') as HTMLInputElement;
const seedInput = document.getElementById('seed-input') as HTMLInputElement;
const fractalControl = document.getElementById('fractal-control') as HTMLDivElement;
const fractalModeInput = document.getElementById('fractal-mode-input') as HTMLSelectElement;
const roomsControl = document.getElementById('rooms-control') as HTMLDivElement;
const roomsModeInput = document.getElementById('rooms-mode-input') as HTMLSelectElement;
const voronoiControl = document.getElementById('voronoi-control') as HTMLDivElement;
const voronoiPresetInput = document.getElementById('voronoi-preset-input') as HTMLSelectElement;
const caControl = document.getElementById('ca-control') as HTMLDivElement;
const caRuleInput = document.getElementById('ca-rule-input') as HTMLSelectElement;
const regenerateButton = document.getElementById('regen-btn') as HTMLButtonElement;
const matrixMazeEl = document.getElementById('matrix-maze') as HTMLDivElement;
const matrixTextEl = document.getElementById('matrix-output') as HTMLPreElement;
const graphSvgEl = document.getElementById('graph-output-visual') as SVGSVGElement;
const graphTextEl = document.getElementById('graph-output') as HTMLPreElement;
const summaryEl = document.getElementById('summary') as HTMLDivElement;

function parseAlgorithm(value: string): Algorithm {
  switch (value) {
    case Algorithm.DFS:
    case Algorithm.PRIMS:
    case Algorithm.KRUSKALS:
    case Algorithm.BINARY_TREE:
    case Algorithm.WILSONS:
    case Algorithm.ALDOUS_BRODER:
    case Algorithm.ELLERS:
    case Algorithm.SIDEWINDER:
    case Algorithm.SPIRAL_BACKTRACKER:
    case Algorithm.HUNT_AND_KILL:
    case Algorithm.RECURSIVE_DIVISION:
    case Algorithm.GROWING_TREE:
    case Algorithm.HOUSTONS:
    case Algorithm.TREMAUX:
    case Algorithm.FRACTAL_TESSELLATION:
    case Algorithm.VORONOI_DIAGRAM:
    case Algorithm.ROOMS_AND_CORRIDORS:
    case Algorithm.SPANNING_TREE_BFS:
    case Algorithm.CELLULAR_AUTOMATON:
      return value;
    default:
      return Algorithm.DFS;
  }
}

function readFractalMode(value: string): FractalMode {
  return value === 'quadtree-division' ? 'quadtree-division' : 'tile-substitution';
}

function readRoomsMode(value: string): RoomsConnectionMode {
  if (value === 'random-walk' || value === 'nearest-mst') {
    return value;
  }
  return 'manhattan-l';
}

function readVoronoiPreset(value: string): VoronoiPreset {
  return value === 'structured' ? 'structured' : 'natural';
}

function readCaRule(value: string): CellularAutomatonRule {
  if (value === 'maze' || value === 'mazectric') {
    return value;
  }
  return 'b5s45';
}

function renderMatrix(matrix: number[][], container: HTMLDivElement): void {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  container.style.gridTemplateColumns = `repeat(${cols}, ${CELL_PX}px)`;

  const needed = rows * cols;
  while (container.children.length < needed) {
    container.appendChild(document.createElement('div'));
  }
  while (container.children.length > needed) {
    container.lastChild?.remove();
  }

  let index = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = container.children[index] as HTMLDivElement;
      cell.className = matrix[row][col] === 1 ? 'path' : 'wall';
      index++;
    }
  }
}

function renderGraphSvg(
  width: number,
  height: number,
  graph: Array<{ id: number; x: number; y: number }>,
  links: Array<{ sourceId: number; targetId: number }>,
  container: SVGSVGElement,
): void {
  const gap = 28;
  const padding = 18;
  const radius = Math.max(2, Math.min(5, 8 - Math.max(width, height) / 6));
  const labelNodes = graph.length <= 36;
  const viewWidth = Math.max(2 * padding + (width - 1) * gap, 80);
  const viewHeight = Math.max(2 * padding + (height - 1) * gap, 80);

  const lines = links
    .map(({ sourceId, targetId }) => {
      const source = graph[sourceId];
      const target = graph[targetId];
      if (source === undefined || target === undefined) {
        return '';
      }

      const x1 = padding + source.x * gap;
      const y1 = padding + source.y * gap;
      const x2 = padding + target.x * gap;
      const y2 = padding + target.y * gap;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`;
    })
    .join('');

  const nodes = graph
    .map((node) => {
      const cx = padding + node.x * gap;
      const cy = padding + node.y * gap;
      const label = labelNodes
        ? `<text x="${cx}" y="${cy + 3}" text-anchor="middle">${node.id}</text>`
        : '';

      return [
        `<g class="node">`,
        `<title>Node ${node.id} (${node.x}, ${node.y})</title>`,
        `<circle cx="${cx}" cy="${cy}" r="${radius}"></circle>`,
        label,
        `</g>`,
      ].join('');
    })
    .join('');

  container.setAttribute('viewBox', `0 0 ${viewWidth} ${viewHeight}`);
  container.innerHTML = `<g class="edges">${lines}</g><g class="nodes">${nodes}</g>`;
}

function appendSummaryCard(
  container: HTMLDivElement,
  label: string,
  value: string,
): void {
  const card = document.createElement('div');
  card.className = 'summary-card';

  const labelEl = document.createElement('span');
  labelEl.textContent = label;

  const valueEl = document.createElement('strong');
  valueEl.textContent = value;

  card.appendChild(labelEl);
  card.appendChild(valueEl);
  container.appendChild(card);
}

function renderSummary(
  container: HTMLDivElement,
  algorithmLabel: string,
  seed: number,
  matrixRows: number,
  matrixCols: number,
  nodeCount: number,
  edgeCount: number,
): void {
  container.replaceChildren();
  appendSummaryCard(container, 'Algorithm', algorithmLabel);
  appendSummaryCard(container, 'Seed', String(seed));
  appendSummaryCard(container, 'Matrix Size', `${matrixRows} × ${matrixCols}`);
  appendSummaryCard(container, 'Graph', `${nodeCount} nodes / ${edgeCount} edges`);
}

function updateControlVisibility(): void {
  const algorithm = parseAlgorithm(algorithmInput.value);
  fractalControl.hidden = algorithm !== Algorithm.FRACTAL_TESSELLATION;
  roomsControl.hidden = algorithm !== Algorithm.ROOMS_AND_CORRIDORS;
  voronoiControl.hidden = algorithm !== Algorithm.VORONOI_DIAGRAM;
  caControl.hidden = algorithm !== Algorithm.CELLULAR_AUTOMATON;
}

function generate(): void {
  const width = Math.max(2, Math.min(24, parseInt(widthInput.value, 10) || 10));
  const height = Math.max(2, Math.min(18, parseInt(heightInput.value, 10) || 8));
  const seed = parseInt(seedInput.value, 10);
  const algorithm = parseAlgorithm(algorithmInput.value);

  widthInput.value = String(width);
  heightInput.value = String(height);
  seedInput.value = String(Number.isFinite(seed) ? seed : 42);

  const config = {
    width,
    height,
    algorithm,
    seed: Number.isFinite(seed) ? seed : 42,
    fractalMode: algorithm === Algorithm.FRACTAL_TESSELLATION
      ? readFractalMode(fractalModeInput.value)
      : undefined,
    roomsConnectionMode: algorithm === Algorithm.ROOMS_AND_CORRIDORS
      ? readRoomsMode(roomsModeInput.value)
      : undefined,
    voronoiPreset: algorithm === Algorithm.VORONOI_DIAGRAM
      ? readVoronoiPreset(voronoiPresetInput.value)
      : undefined,
    caRule: algorithm === Algorithm.CELLULAR_AUTOMATON
      ? readCaRule(caRuleInput.value)
      : undefined,
  };

  const preview = buildFormatsPreview(config);
  const edgeCount = preview.graphLinks.length;
  const matrixRows = preview.matrix.length;
  const matrixCols = preview.matrix[0]?.length ?? 0;
  const algorithmLabel = algorithmInput.selectedOptions[0]?.textContent ?? algorithm;

  renderMatrix(preview.matrix, matrixMazeEl);
  renderGraphSvg(width, height, preview.graph, preview.graphLinks, graphSvgEl);
  matrixTextEl.textContent = preview.matrixText;
  graphTextEl.textContent = preview.graphText;
  renderSummary(
    summaryEl,
    algorithmLabel,
    config.seed,
    matrixRows,
    matrixCols,
    preview.graph.length,
    edgeCount,
  );
}

updateControlVisibility();
generate();

regenerateButton.addEventListener('click', generate);
algorithmInput.addEventListener('change', () => {
  updateControlVisibility();
  generate();
});

[
  widthInput,
  heightInput,
  seedInput,
  fractalModeInput,
  roomsModeInput,
  voronoiPresetInput,
  caRuleInput,
].forEach((element) => {
  element.addEventListener('change', generate);
});
