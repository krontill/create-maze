import { generateMaze, Algorithm } from '../src/index';
import type { MazeMatrix } from '../src/index';
import type { RoomsConnectionMode } from '../src/index';

const CELL_PX = 8;

interface AlgorithmDef {
  algo: Algorithm;
  label: string;
  color: string;
  seed?: number;
  fractalMode?: 'tile-substitution' | 'quadtree-division';
  roomsConnectionMode?: RoomsConnectionMode;
}

interface TimedMaze {
  maze: MazeMatrix;
  label: string;
  generationMs: number;
}

interface RenderMetrics {
  generationTotalMs: number;
  overlayBuildMs: number;
  mazeRenderMs: number;
  fullCycleMs: number;
}

const ALGORITHMS: AlgorithmDef[] = [
  { algo: Algorithm.DFS,               label: 'Depth-First Search',   color: '#ef4444' },
  { algo: Algorithm.PRIMS,             label: "Prim's",               color: '#f97316' },
  { algo: Algorithm.KRUSKALS,          label: "Kruskal's",            color: '#eab308' },
  { algo: Algorithm.BINARY_TREE,       label: 'Binary Tree',          color: '#22c55e' },
  { algo: Algorithm.WILSONS,           label: "Wilson's",             color: '#14b8a6' },
  { algo: Algorithm.ALDOUS_BRODER,     label: 'Aldous-Broder',        color: '#06b6d4' },
  { algo: Algorithm.ELLERS,            label: "Eller's",              color: '#3b82f6' },
  { algo: Algorithm.SIDEWINDER,        label: 'Sidewinder',           color: '#6366f1' },
  { algo: Algorithm.SPIRAL_BACKTRACKER,label: 'Spiral Backtracker (seed 0)', color: '#0ea5e9', seed: 0 },
  { algo: Algorithm.SPIRAL_BACKTRACKER,label: 'Spiral Backtracker (seed 1)', color: '#0284c7', seed: 1 },
  { algo: Algorithm.SPIRAL_BACKTRACKER,label: 'Spiral Backtracker (seed 2)', color: '#0369a1', seed: 2 },
  { algo: Algorithm.HUNT_AND_KILL,     label: 'Hunt-and-Kill',        color: '#a855f7' },
  { algo: Algorithm.RECURSIVE_DIVISION,label: 'Recursive Division',   color: '#ec4899' },
  { algo: Algorithm.FRACTAL_TESSELLATION, label: 'Fractal Tessellation (Tile Substitution)', color: '#f43f5e', fractalMode: 'tile-substitution' },
  { algo: Algorithm.FRACTAL_TESSELLATION, label: 'Fractal Tessellation (Quadtree Division)', color: '#10b981', fractalMode: 'quadtree-division' },
  { algo: Algorithm.ROOMS_AND_CORRIDORS, label: 'Rooms & Corridors (Manhattan-L)', color: '#8b5cf6', roomsConnectionMode: 'manhattan-l' },
  { algo: Algorithm.ROOMS_AND_CORRIDORS, label: 'Rooms & Corridors (Random Walk)', color: '#14b8a6', roomsConnectionMode: 'random-walk' },
  { algo: Algorithm.ROOMS_AND_CORRIDORS, label: 'Rooms & Corridors (Nearest MST)', color: '#f59e0b', roomsConnectionMode: 'nearest-mst' },
  { algo: Algorithm.GROWING_TREE,      label: 'Growing Tree',         color: '#84cc16' },
  { algo: Algorithm.HOUSTONS,          label: "Houston's",            color: '#d946ef' },
  { algo: Algorithm.TREMAUX,           label: 'Tremaux',              color: '#f59e0b' },
];

// ---------- data helpers ----------

function generateAllMazes(
  selected: AlgorithmDef[],
  width: number,
  height: number,
): TimedMaze[] {
  return selected.map(({ algo, label, seed, fractalMode, roomsConnectionMode }) => {
    const startedAt = performance.now();
    const maze = generateMaze({
      width,
      height,
      algorithm: algo,
      seed,
      fractalMode,
      roomsConnectionMode,
    }) as MazeMatrix;
    const endedAt = performance.now();

    return {
      maze,
      label,
      generationMs: endedAt - startedAt,
    };
  });
}

/**
 * For each cell (r, c) collect the labels of all selected algorithms that have a path (1) there.
 * Returns a 3-D array: overlay[r][c] = string[] of algorithm labels.
 */
function buildOverlay(mazes: MazeMatrix[], selected: AlgorithmDef[]): string[][][] {
  const rows = mazes[0].length;
  const cols = mazes[0][0].length;
  const overlay: string[][][] = [];

  for (let r = 0; r < rows; r++) {
    overlay[r] = [];
    for (let c = 0; c < cols; c++) {
      const labels: string[] = [];
      for (let i = 0; i < mazes.length; i++) {
        if (mazes[i][r][c] === 1) {
          labels.push(selected[i].label);
        }
      }
      overlay[r][c] = labels;
    }
  }

  return overlay;
}

function getSelectedAlgorithms(container: HTMLElement): AlgorithmDef[] {
  return ALGORITHMS.filter((_, index) => {
    const cb = container.querySelector<HTMLInputElement>(`input[data-index="${index}"]`);
    return cb?.checked ?? true;
  });
}

// ---------- rendering ----------

function buildLegend(container: HTMLElement, onToggle: () => void): void {
  container.innerHTML = '';
  for (const [index, { algo, label, color }] of ALGORITHMS.entries()) {
    const item = document.createElement('label');
    item.className = 'legend-item';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = false;
    cb.defaultChecked = false;
    cb.dataset['algo'] = algo;
    cb.dataset['index'] = String(index);
    cb.style.accentColor = color;
    cb.addEventListener('change', onToggle);

    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = color;

    const text = document.createElement('span');
    text.textContent = label;

    item.appendChild(cb);
    item.appendChild(swatch);
    item.appendChild(text);
    container.appendChild(item);
  }
}

function renderCompareMaze(overlay: string[][][], container: HTMLElement): void {
  const rows = overlay.length;
  const cols = overlay[0]?.length ?? 0;

  container.style.gridTemplateColumns = `repeat(${cols}, ${CELL_PX}px)`;

  const needed = rows * cols;
  while (container.children.length > needed) {
    container.lastChild?.remove();
  }
  while (container.children.length < needed) {
    container.appendChild(document.createElement('div'));
  }

  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const el = container.children[i] as HTMLElement;
      const labels = overlay[r][c];
      const count = labels.length;

      // Reset
      el.style.cssText = `width:${CELL_PX}px;height:${CELL_PX}px;`;
      el.textContent = '';
      el.dataset['algos'] = labels.join(', ');

      if (count === 0) {
        el.className = 'wall';
        el.dataset['algos'] = '';
      } else if (count === 1) {
        el.className = 'path';
        el.style.backgroundColor = ALGORITHMS.find(a => a.label === labels[0])!.color;
      } else {
        el.className = 'path overlap';
        el.style.backgroundColor = '#6b7280';
        el.style.color = '#fff';
        el.style.fontSize = '6px';
        el.style.lineHeight = `${CELL_PX}px`;
        el.style.textAlign = 'center';
        el.textContent = String(count);
      }

      i++;
    }
  }
}

function renderTimingSummary(
  timedMazes: TimedMaze[],
  metrics: RenderMetrics | null,
  container: HTMLElement,
): void {
  if (timedMazes.length === 0) {
    container.innerHTML = '';
    return;
  }

  const totalMs = timedMazes.reduce((sum, item) => sum + item.generationMs, 0);

  const rows = timedMazes
    .map(({ label, generationMs }) => {
      return `<li><span>${label}</span><strong>${generationMs.toFixed(2)} ms</strong></li>`;
    })
    .join('');

  const details = metrics
    ? [
        `<p class="timing-detail"><span>Overlay Build</span><strong>${metrics.overlayBuildMs.toFixed(2)} ms</strong></p>`,
        `<p class="timing-detail"><span>Maze DOM Render</span><strong>${metrics.mazeRenderMs.toFixed(2)} ms</strong></p>`,
        `<p class="timing-total"><span>Generation Total</span><strong>${metrics.generationTotalMs.toFixed(2)} ms</strong></p>`,
        `<p class="timing-total timing-full"><span>Full Render Cycle</span><strong>${metrics.fullCycleMs.toFixed(2)} ms</strong></p>`,
      ].join('')
    : `<p class="timing-total"><span>Generation Total</span><strong>${totalMs.toFixed(2)} ms</strong></p>`;

  container.innerHTML = [
    '<h3>Algorithm Generation Time</h3>',
    `<ul>${rows}</ul>`,
    details,
  ].join('');
}

// ---------- tooltip ----------

function initTooltip(mazeEl: HTMLElement): void {
  const tooltip = document.createElement('div');
  tooltip.id = 'tooltip';
  document.body.appendChild(tooltip);

  mazeEl.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    if (!target.dataset['algos'] && target.dataset['algos'] !== '') return;

    const algos = target.dataset['algos'];
    if (!algos) {
      tooltip.textContent = 'Wall (no paths)';
    } else {
      tooltip.textContent = algos;
    }
    tooltip.style.display = 'block';
  });

  mazeEl.addEventListener('mouseout', (e) => {
    const related = e.relatedTarget as HTMLElement | null;
    if (!related || !mazeEl.contains(related)) {
      tooltip.style.display = 'none';
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (tooltip.style.display !== 'block') return;
    const x = e.clientX + 14;
    const y = e.clientY + 14;
    // Keep tooltip within viewport
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    tooltip.style.left = `${Math.min(x, window.innerWidth  - tw - 8)}px`;
    tooltip.style.top  = `${Math.min(y, window.innerHeight - th - 8)}px`;
  });
}

// ---------- entry ----------

const wInput        = document.querySelector<HTMLInputElement>('#w-input')!;
const hInput        = document.querySelector<HTMLInputElement>('#h-input')!;
const regenBtn      = document.querySelector<HTMLButtonElement>('#regen-btn')!;
const selectAllBtn  = document.querySelector<HTMLButtonElement>('#select-all-btn')!;
const deselectAllBtn= document.querySelector<HTMLButtonElement>('#deselect-all-btn')!;
const legendEl      = document.querySelector<HTMLElement>('#legend')!;
const mazeEl        = document.querySelector<HTMLElement>('#compare-maze')!;
const timingsEl     = document.querySelector<HTMLElement>('#timings')!;

function generate(): void {
  const cycleStartedAt = performance.now();
  const selected = getSelectedAlgorithms(legendEl);
  if (selected.length === 0) {
    mazeEl.innerHTML = '';
    renderTimingSummary([], null, timingsEl);
    return;
  }

  const width  = Math.max(2, Math.min(200, parseInt(wInput.value,  10) || 90));
  const height = Math.max(2, Math.min(200, parseInt(hInput.value, 10) || 40));
  wInput.value  = String(width);
  hInput.value = String(height);

  const timedMazes = generateAllMazes(selected, width, height);
  const generationTotalMs = timedMazes.reduce((sum, entry) => sum + entry.generationMs, 0);

  const overlayStartedAt = performance.now();
  const mazes = timedMazes.map((entry) => entry.maze);
  const overlay = buildOverlay(mazes, selected);
  const overlayBuildMs = performance.now() - overlayStartedAt;

  const renderStartedAt = performance.now();
  renderCompareMaze(overlay, mazeEl);
  const mazeRenderMs = performance.now() - renderStartedAt;

  const fullCycleMs = performance.now() - cycleStartedAt;
  renderTimingSummary(
    timedMazes,
    {
      generationTotalMs,
      overlayBuildMs,
      mazeRenderMs,
      fullCycleMs,
    },
    timingsEl,
  );
}

buildLegend(legendEl, generate);
initTooltip(mazeEl);

regenBtn.addEventListener('click', generate);
wInput.addEventListener('change', generate);
hInput.addEventListener('change', generate);

selectAllBtn.addEventListener('click', () => {
  legendEl.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(cb => { cb.checked = true; });
  generate();
});

deselectAllBtn.addEventListener('click', () => {
  legendEl.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
  generate();
});

generate();
