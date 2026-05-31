import { generateMazeSteps, Algorithm } from '../src/index';
import type { MazeMatrix } from '../src/index';

// ── Types ─────────────────────────────────────────────────────────────────

interface AlgoVariant {
  algorithm: Algorithm;
  label: string;
  seed?: number;
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

/** Maps checkbox value → AlgoVariant */
const VARIANT_MAP: Record<string, AlgoVariant> = {
  'dfs':                    { algorithm: Algorithm.DFS,                label: 'DFS' },
  'prims':                  { algorithm: Algorithm.PRIMS,              label: "Prim's" },
  'kruskals':               { algorithm: Algorithm.KRUSKALS,           label: "Kruskal's" },
  'growing-tree':           { algorithm: Algorithm.GROWING_TREE,       label: 'Growing Tree' },
  'hunt-and-kill':          { algorithm: Algorithm.HUNT_AND_KILL,      label: 'Hunt-and-Kill' },
  'spanning-tree-bfs':      { algorithm: Algorithm.SPANNING_TREE_BFS,  label: 'Spanning Tree BFS' },
  'wilsons':                { algorithm: Algorithm.WILSONS,            label: "Wilson's" },
  'aldous-broder':          { algorithm: Algorithm.ALDOUS_BRODER,      label: 'Aldous-Broder' },
  'houstons':               { algorithm: Algorithm.HOUSTONS,           label: "Houston's" },
  'ellers':                 { algorithm: Algorithm.ELLERS,             label: "Eller's" },
  'sidewinder':             { algorithm: Algorithm.SIDEWINDER,         label: 'Sidewinder' },
  'binary-tree':            { algorithm: Algorithm.BINARY_TREE,        label: 'Binary Tree' },
  'spiral-backtracker':     { algorithm: Algorithm.SPIRAL_BACKTRACKER, label: 'Spiral Backtracker' },
  'tremaux':                { algorithm: Algorithm.TREMAUX,            label: 'Trémaux' },
  'recursive-division':     { algorithm: Algorithm.RECURSIVE_DIVISION, label: 'Recursive Division' },
  'fractal-tessellation':   { algorithm: Algorithm.FRACTAL_TESSELLATION, label: 'Fractal Tessellation (Tile)', fractalMode: 'tile-substitution' },
  'fractal-tessellation-qt':{ algorithm: Algorithm.FRACTAL_TESSELLATION, label: 'Fractal Tessellation (Quadtree)', fractalMode: 'quadtree-division' },
  'voronoi-natural':        { algorithm: Algorithm.VORONOI_DIAGRAM,    label: 'Voronoi (Natural)', voronoiPreset: 'natural' },
  'voronoi-structured':     { algorithm: Algorithm.VORONOI_DIAGRAM,    label: 'Voronoi (Structured)', voronoiPreset: 'structured' },
  'rooms-manhattan':        { algorithm: Algorithm.ROOMS_AND_CORRIDORS, label: 'Rooms & Corridors (Manhattan)', roomsConnectionMode: 'manhattan-l' },
  'rooms-random-walk':      { algorithm: Algorithm.ROOMS_AND_CORRIDORS, label: 'Rooms & Corridors (Walk)', roomsConnectionMode: 'random-walk' },
  'rooms-nearest-mst':      { algorithm: Algorithm.ROOMS_AND_CORRIDORS, label: 'Rooms & Corridors (MST)', roomsConnectionMode: 'nearest-mst' },
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

function buildSteps(variant: AlgoVariant, width: number, height: number): MazeMatrix[] {
  return generateMazeSteps({
    width,
    height,
    algorithm: variant.algorithm,
    seed: variant.seed,
    fractalMode: variant.fractalMode,
    roomsConnectionMode: variant.roomsConnectionMode,
    voronoiPreset: variant.voronoiPreset,
  });
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
  if (algoMap.size === 0) return;
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

  const width  = getWidth();
  const height = getHeight();
  widthInput.value  = String(width);
  heightInput.value = String(height);

  for (const cb of ALL_CHECKBOXES) {
    if (cb.checked) addPanel(cb.value, width, height);
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
