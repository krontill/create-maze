import { generateMazeSteps, Algorithm, ALGORITHM_VARIANTS } from '../src/index';
import type { MazeMatrix } from '../src/index';
import type { CellularAutomatonRule } from '../src/index';
import type { AlgorithmVariant } from '../src/index';
import { createRandom } from '../src/utils/random';

// ── Types ─────────────────────────────────────────────────────────────────

interface AlgoVariant {
  algorithm: Algorithm;
  label: string;
  seed?: number;
  caRule?: CellularAutomatonRule;
  fractalMode?: 'tile-substitution' | 'quadtree-division';
  roomsConnectionMode?: 'manhattan-l' | 'random-walk' | 'nearest-mst';
  voronoiPreset?: 'natural' | 'structured';
}

interface AlgoEntry {
  variant: AlgoVariant;
  steps: MazeMatrix[];
  fig: HTMLElement;
  container: HTMLElement;
  caption: HTMLElement;
}

// ── Constants ─────────────────────────────────────────────────────────────

const CELL_PX = 6;
const DEFAULT_CA_FILL_RATIO = 0.45;

/** Maps checkbox value → AlgoVariant */
function getSharedVariant(key: string): AlgorithmVariant {
  const variant = ALGORITHM_VARIANTS.find((entry) => entry.key === key);
  if (variant === undefined) {
    throw new Error(`Missing shared algorithm variant for key "${key}"`);
  }
  return variant;
}

function toAlgoVariant(variant: AlgorithmVariant, labelOverride?: string): AlgoVariant {
  return {
    algorithm: variant.algorithm,
    label: labelOverride ?? variant.label,
    seed: variant.seed,
    caRule: variant.caRule,
    fractalMode: variant.fractalMode,
    roomsConnectionMode: variant.roomsConnectionMode,
    voronoiPreset: variant.voronoiPreset,
  };
}

const VARIANT_MAP: Record<string, AlgoVariant> = {
  'dfs': toAlgoVariant(getSharedVariant('dfs'), 'DFS'),
  'prims': toAlgoVariant(getSharedVariant('prims')),
  'kruskals': toAlgoVariant(getSharedVariant('kruskals')),
  'growing-tree': toAlgoVariant(getSharedVariant('growing-tree')),
  'hunt-and-kill': toAlgoVariant(getSharedVariant('hunt-and-kill')),
  'spanning-tree-bfs': toAlgoVariant(getSharedVariant('spanning-tree-bfs')),
  'wilsons': toAlgoVariant(getSharedVariant('wilsons')),
  'aldous-broder': toAlgoVariant(getSharedVariant('aldous-broder')),
  'houstons': toAlgoVariant(getSharedVariant('houstons')),
  'ellers': toAlgoVariant(getSharedVariant('ellers')),
  'sidewinder': toAlgoVariant(getSharedVariant('sidewinder')),
  'binary-tree': toAlgoVariant(getSharedVariant('binary-tree')),
  'spiral-backtracker': toAlgoVariant(getSharedVariant('spiral-backtracker-0'), 'Spiral Backtracker'),
  'tremaux': toAlgoVariant(getSharedVariant('tremaux'), 'Trémaux'),
  'recursive-division': toAlgoVariant(getSharedVariant('recursive-division')),
  'fractal-tessellation': toAlgoVariant(getSharedVariant('fractal-tessellation-tile-substitution'), 'Fractal Tessellation (Tile)'),
  'fractal-tessellation-qt': toAlgoVariant(getSharedVariant('fractal-tessellation-quadtree-division'), 'Fractal Tessellation (Quadtree)'),
  'voronoi-natural': toAlgoVariant(getSharedVariant('voronoi-diagram-natural'), 'Voronoi (Natural)'),
  'voronoi-structured': toAlgoVariant(getSharedVariant('voronoi-diagram-structured'), 'Voronoi (Structured)'),
  'rooms-manhattan': toAlgoVariant(getSharedVariant('rooms-and-corridors-manhattan-l'), 'Rooms & Corridors (Manhattan)'),
  'rooms-random-walk': toAlgoVariant(getSharedVariant('rooms-and-corridors-random-walk'), 'Rooms & Corridors (Walk)'),
  'rooms-nearest-mst': toAlgoVariant(getSharedVariant('rooms-and-corridors-nearest-mst'), 'Rooms & Corridors (MST)'),
  'cellular-automaton': toAlgoVariant(getSharedVariant('cellular-automaton-b5s45')),
  'cellular-automaton-maze': toAlgoVariant(getSharedVariant('cellular-automaton-maze')),
  'cellular-automaton-mazectric': toAlgoVariant(getSharedVariant('cellular-automaton-mazectric')),
};

/** All sidebar checkboxes in document order — used for panel ordering. */
const ALL_CHECKBOXES = Array.from(
  document.querySelectorAll<HTMLInputElement>('.algo-check input[type="checkbox"]'),
);

// ── DOM refs ──────────────────────────────────────────────────────────────

const panelGrid   = document.getElementById('panel-grid')     as HTMLDivElement;
const btnGenerate = document.getElementById('btn-generate')   as HTMLButtonElement;
const btnAll      = document.getElementById('btn-all')        as HTMLButtonElement;
const btnNone     = document.getElementById('btn-none')       as HTMLButtonElement;
const btnPlay     = document.getElementById('btn-play-pause') as HTMLButtonElement;
const btnPrev     = document.getElementById('btn-prev')       as HTMLButtonElement;
const btnNext     = document.getElementById('btn-next')       as HTMLButtonElement;
const btnRestart  = document.getElementById('btn-restart')    as HTMLButtonElement;
const speedSlider = document.getElementById('speed-slider')   as HTMLInputElement;
const progressBar = document.getElementById('progress-bar')   as HTMLProgressElement;
const stepCounter = document.getElementById('step-counter')   as HTMLSpanElement;
const widthInput  = document.getElementById('inp-width')      as HTMLInputElement;
const heightInput = document.getElementById('inp-height')     as HTMLInputElement;

// ── State ─────────────────────────────────────────────────────────────────

/** Active algo entries keyed by checkbox value. */
const algoMap = new Map<string, AlgoEntry>();

let currentStep = 0;
let maxSteps = 0;
let isPlaying = false;
let rafId: number | null = null;
let lastFrameTime = 0;
/** ms per frame — derived from speed slider (1 → ~500ms, 10 → ~16ms) */
let frameInterval = 120;

// ── Helpers ───────────────────────────────────────────────────────────────

function speedToInterval(value: number): number {
  // value in [1,10] → interval in [500, 16] ms (exponential)
  const t = (value - 1) / 9;
  return Math.round(500 * Math.pow(500 / 16, -t));
}

function getWidth():  number { return Math.max(2, Math.min(100, parseInt(widthInput.value, 10)  || 12)); }
function getHeight(): number { return Math.max(2, Math.min(100, parseInt(heightInput.value, 10) || 9));  }

/** Checked checkboxes are source of truth for which algorithms are generated. */
function getSelectedAlgorithmKeys(): string[] {
  const keys: string[] = [];
  for (const cb of ALL_CHECKBOXES) {
    if (cb.checked && VARIANT_MAP[cb.value]) keys.push(cb.value);
  }
  return keys;
}

function syncAlgoMapToSelection(selectedKeys: string[]): void {
  const selectedSet = new Set(selectedKeys);
  for (const key of Array.from(algoMap.keys())) {
    if (!selectedSet.has(key)) removePanel(key);
  }
}

function recalcMaxSteps(): void {
  maxSteps = 0;
  for (const entry of algoMap.values()) {
    if (entry.steps.length > maxSteps) maxSteps = entry.steps.length;
  }
}

function updatePlaybar(): void {
  if (maxSteps === 0) {
    progressBar.value = 0;
    progressBar.max   = 1;
    stepCounter.textContent = '— / —';
    btnPrev.disabled = true;
    btnNext.disabled = true;
    return;
  }
  const pct = maxSteps > 1 ? currentStep / (maxSteps - 1) : 1;
  progressBar.value = pct;
  progressBar.max   = 1;
  stepCounter.textContent = `Step ${currentStep + 1} / ${maxSteps}`;
  btnPrev.disabled = currentStep === 0;
  btnNext.disabled = currentStep >= maxSteps - 1;
}

function syncEmptyState(): void {
  const empty = panelGrid.querySelector('.panel-empty');
  if (algoMap.size === 0 && !empty) {
    panelGrid.innerHTML = '<p class="panel-empty">No algorithms selected.</p>';
  } else if (algoMap.size > 0 && empty) {
    empty.remove();
  }
}

/** Render a MazeMatrix into a container element using CSS Grid. */
function renderMaze(matrix: MazeMatrix, container: HTMLElement): void {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  container.style.gridTemplateColumns = `repeat(${cols}, ${CELL_PX}px)`;
  container.style.gridTemplateRows    = `repeat(${rows}, ${CELL_PX}px)`;

  const needed = rows * cols;
  // Add missing children
  while (container.children.length < needed) {
    container.appendChild(document.createElement('div'));
  }
  // Remove extra children
  while (container.children.length > needed) {
    container.removeChild(container.lastChild!);
  }

  let idx = 0;
  for (let r = 0; r < rows; r++) {
    const row = matrix[r]!;
    for (let c = 0; c < cols; c++) {
      const cell = container.children[idx] as HTMLElement;
      const isPath = row[c] === 1;
      cell.className = isPath ? 'p' : 'w';
      idx++;
    }
  }
}

/** Update all panels to show step `stepIdx`. */
function renderStep(stepIdx: number): void {
  currentStep = maxSteps > 0 ? Math.max(0, Math.min(stepIdx, maxSteps - 1)) : 0;
  for (const entry of algoMap.values()) {
    const displayIdx = Math.min(currentStep, entry.steps.length - 1);
    if (displayIdx >= 0) renderMaze(entry.steps[displayIdx]!, entry.container);
  }
  updatePlaybar();
}

// ── Animation loop ────────────────────────────────────────────────────────

function stopAnimation(): void {
  isPlaying = false;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  btnPlay.textContent = '▶';
}

function animationLoop(timestamp: number): void {
  if (!isPlaying) return;

  if (timestamp - lastFrameTime >= frameInterval) {
    lastFrameTime = timestamp;
    if (currentStep >= maxSteps - 1) {
      stopAnimation();
      return;
    }
    renderStep(currentStep + 1);
  }
  rafId = requestAnimationFrame(animationLoop);
}

function startAnimation(): void {
  if (maxSteps === 0) return;
  isPlaying = true;
  btnPlay.textContent = '⏸';
  lastFrameTime = 0;
  rafId = requestAnimationFrame(animationLoop);
}

// ── Panel DOM helpers ─────────────────────────────────────────────────────

function createFigure(key: string, variant: AlgoVariant, stepCount: number): {
  fig: HTMLElement; container: HTMLElement; caption: HTMLElement;
} {
  const fig = document.createElement('figure');
  fig.className = 'panel';
  fig.dataset['key'] = key;

  const caption = document.createElement('figcaption');
  caption.innerHTML = `<strong>${variant.label}</strong> · ${stepCount} steps`;
  fig.appendChild(caption);

  const wrap = document.createElement('div');
  wrap.className = 'maze-container';
  const container = document.createElement('div');
  container.className = 'maze';
  wrap.appendChild(container);
  fig.appendChild(wrap);

  return { fig, container, caption };
}

/** Returns the first existing panel whose checkbox comes after `key` in sidebar order. */
function findInsertBefore(key: string): Element | null {
  const keyIdx = ALL_CHECKBOXES.findIndex(cb => cb.value === key);
  for (let i = keyIdx + 1; i < ALL_CHECKBOXES.length; i++) {
    const k = ALL_CHECKBOXES[i]!.value;
    const existing = panelGrid.querySelector<Element>(`[data-key="${k}"]`);
    if (existing) return existing;
  }
  return null;
}

function createCarvingBaseStep(width: number, height: number): MazeMatrix {
  const rows = 2 * height + 1;
  const cols = 2 * width + 1;
  const grid = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

  // Keep entry/exit openings consistent with core grid rules.
  grid[1][0] = 1;
  grid[2 * height - 1][2 * width] = 1;

  return grid;
}

function createCellCentersStep(width: number, height: number): MazeMatrix {
  const grid = createCarvingBaseStep(width, height);

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      grid[2 * r + 1][2 * c + 1] = 1;
    }
  }

  return grid;
}

function createOpenFieldStep(width: number, height: number): MazeMatrix {
  const grid = createCellCentersStep(width, height);

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (r + 1 < height) {
        grid[2 * r + 2][2 * c + 1] = 1;
      }
      if (c + 1 < width) {
        grid[2 * r + 1][2 * c + 2] = 1;
      }
    }
  }

  return grid;
}

function createCellularAutomatonSeedStep(
  variant: AlgoVariant,
  width: number,
  height: number,
): MazeMatrix {
  const random = createRandom(variant.seed);
  const fillRatio = DEFAULT_CA_FILL_RATIO;
  const alive: boolean[][] = Array.from(
    { length: height },
    () => Array.from({ length: width }, () => random() < fillRatio),
  );

  // Mirror algorithm anchor: entry cell starts alive.
  alive[0][0] = true;

  const grid = createCarvingBaseStep(width, height);

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (!alive[r][c]) continue;

      grid[2 * r + 1][2 * c + 1] = 1;

      if (r + 1 < height && alive[r + 1][c]) {
        grid[2 * r + 2][2 * c + 1] = 1;
      }
      if (c + 1 < width && alive[r][c + 1]) {
        grid[2 * r + 1][2 * c + 2] = 1;
      }
    }
  }

  return grid;
}

function createZeroStateStep(variant: AlgoVariant, width: number, height: number): MazeMatrix {
  if (variant.algorithm === Algorithm.RECURSIVE_DIVISION) {
    return createOpenFieldStep(width, height);
  }

  if (variant.algorithm === Algorithm.VORONOI_DIAGRAM) {
    return createCellCentersStep(width, height);
  }

  if (variant.algorithm === Algorithm.CELLULAR_AUTOMATON) {
    return createCellularAutomatonSeedStep(variant, width, height);
  }

  return createCarvingBaseStep(width, height);
}

function buildSteps(variant: AlgoVariant, width: number, height: number): MazeMatrix[] {
  const steps = generateMazeSteps({
    width,
    height,
    algorithm: variant.algorithm,
    seed: variant.seed,
    caRule: variant.caRule,
    fractalMode: variant.fractalMode,
    roomsConnectionMode: variant.roomsConnectionMode,
    voronoiPreset: variant.voronoiPreset,
  });

  // Step 1 should always show untouched maze state.
  return [createZeroStateStep(variant, width, height), ...steps];
}

// ── Add / remove panels ───────────────────────────────────────────────────

function addPanel(key: string, width: number, height: number): void {
  const variant = VARIANT_MAP[key];
  if (!variant || algoMap.has(key)) return;

  const steps = buildSteps(variant, width, height);
  const { fig, container, caption } = createFigure(key, variant, steps.length);

  algoMap.set(key, { variant, steps, fig, container, caption });
  // Remove placeholder now that algoMap.size >= 1, then insert the panel
  panelGrid.querySelector('.panel-empty')?.remove();
  panelGrid.insertBefore(fig, findInsertBefore(key));
  recalcMaxSteps();

  // Show the panel at the current playback position immediately
  const displayIdx = Math.min(currentStep, steps.length - 1);
  if (displayIdx >= 0) renderMaze(steps[displayIdx]!, container);
  updatePlaybar();
}

function removePanel(key: string): void {
  const entry = algoMap.get(key);
  if (!entry) return;
  entry.fig.remove();
  algoMap.delete(key);
  recalcMaxSteps();
  if (maxSteps > 0) currentStep = Math.min(currentStep, maxSteps - 1);
  updatePlaybar();
  syncEmptyState();
  if (maxSteps === 0) stopAnimation();
}

// ── Regenerate existing panels when size changes ──────────────────────────

function regenerateAll(): void {
  const selectedKeys = getSelectedAlgorithmKeys();
  syncAlgoMapToSelection(selectedKeys);
  if (algoMap.size === 0) {
    recalcMaxSteps();
    currentStep = 0;
    updatePlaybar();
    return;
  }
  const wasPlaying = isPlaying;
  stopAnimation();

  const width  = getWidth();
  const height = getHeight();
  widthInput.value  = String(width);
  heightInput.value = String(height);

  for (const entry of algoMap.values()) {
    entry.steps = buildSteps(entry.variant, width, height);
    entry.caption.innerHTML = `<strong>${entry.variant.label}</strong> · ${entry.steps.length} steps`;
  }

  recalcMaxSteps();
  currentStep = maxSteps > 0 ? Math.min(currentStep, maxSteps - 1) : 0;
  renderStep(currentStep);
  if (wasPlaying && maxSteps > 0) startAnimation();
}

// ── Full regenerate (Generate & Play button) ──────────────────────────────

function generate(): void {
  stopAnimation();
  algoMap.clear();
  panelGrid.innerHTML = '';
  recalcMaxSteps();
  updatePlaybar();

  const width  = getWidth();
  const height = getHeight();
  widthInput.value  = String(width);
  heightInput.value = String(height);

  for (const key of getSelectedAlgorithmKeys()) {
    addPanel(key, width, height);
  }

  currentStep = 0;
  syncEmptyState();

  if (algoMap.size > 0 && maxSteps > 0) {
    renderStep(0);
    startAnimation();
  }
}

// ── Event listeners ───────────────────────────────────────────────────────

btnGenerate.addEventListener('click', () => { generate(); });

btnAll.addEventListener('click', () => {
  const w = getWidth(), h = getHeight();
  for (const cb of ALL_CHECKBOXES) {
    if (!cb.checked) { cb.checked = true; addPanel(cb.value, w, h); }
  }
});

btnNone.addEventListener('click', () => {
  for (const cb of ALL_CHECKBOXES) {
    if (cb.checked) { cb.checked = false; removePanel(cb.value); }
  }
});

// Checkbox: add or remove the panel immediately, preserving playback position
for (const cb of ALL_CHECKBOXES) {
  cb.addEventListener('change', () => {
    if (cb.checked) {
      addPanel(cb.value, getWidth(), getHeight());
    } else {
      removePanel(cb.value);
    }
  });
}

// Size inputs: regenerate all active panels on commit (blur / Enter)
widthInput.addEventListener('change',  () => { regenerateAll(); });
heightInput.addEventListener('change', () => { regenerateAll(); });

btnPlay.addEventListener('click', () => {
  if (isPlaying) {
    stopAnimation();
  } else {
    if (currentStep >= maxSteps - 1) {
      renderStep(0);
    }
    startAnimation();
  }
});

btnPrev.addEventListener('click', () => {
  stopAnimation();
  renderStep(currentStep - 1);
});

btnNext.addEventListener('click', () => {
  stopAnimation();
  renderStep(currentStep + 1);
});

btnRestart.addEventListener('click', () => {
  stopAnimation();
  renderStep(0);
});

speedSlider.addEventListener('input', () => {
  frameInterval = speedToInterval(parseInt(speedSlider.value, 10));
});

// Initialise frame interval from default slider value
frameInterval = speedToInterval(parseInt(speedSlider.value, 10));

