import { generateMaze, Algorithm } from '../src/index';
import type { MazeMatrix } from '../src/index';

const CELL_PX = 8;
const SPIRAL_SEEDS = [0, 1, 2] as const;
type FractalMode = 'tile-substitution' | 'quadtree-division';
type RoomsConnectionMode = 'manhattan-l' | 'random-walk' | 'nearest-mst';

const ROOMS_MODE_VARIANTS: Array<{ mode: RoomsConnectionMode; label: string }> = [
  { mode: 'manhattan-l', label: 'Manhattan-L' },
  { mode: 'random-walk', label: 'Random Walk' },
  { mode: 'nearest-mst', label: 'Nearest MST' },
];

function getFractalMode(section: HTMLElement): FractalMode | undefined {
  const mode = section.dataset['fractalMode'];
  if (mode === 'tile-substitution' || mode === 'quadtree-division') {
    return mode;
  }
  return undefined;
}

function renderMaze(matrix: MazeMatrix, container: HTMLElement): void {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  container.style.gridTemplateColumns = `repeat(${cols}, ${CELL_PX}px)`;

  // Reuse existing children when count matches to avoid full DOM teardown.
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
      el.style.width = `${CELL_PX}px`;
      el.style.height = `${CELL_PX}px`;
      el.className = matrix[r][c] === 1 ? 'path' : 'wall';
      i++;
    }
  }
}

function initSection(section: HTMLElement): void {
  const algo = section.dataset['algo'] as Algorithm;
  const fractalMode = getFractalMode(section);
  const wInput = section.querySelector<HTMLInputElement>('.w-input')!;
  const hInput = section.querySelector<HTMLInputElement>('.h-input')!;
  const regenBtn = section.querySelector<HTMLButtonElement>('.regen-btn')!;
  const mazeEl = section.querySelector<HTMLElement>('.maze')!;
  const isSpiral = algo === Algorithm.SPIRAL_BACKTRACKER;
  const isRoomsAndCorridors = algo === Algorithm.ROOMS_AND_CORRIDORS;

  let spiralMazeTargets: HTMLElement[] = [];
  let roomsMazeTargets: HTMLElement[] = [];
  if (isSpiral || isRoomsAndCorridors) {
    const mazeWrap = section.querySelector<HTMLElement>('.maze-wrap')!;
    mazeWrap.innerHTML = '';

    const examplesEl = document.createElement('div');
    examplesEl.className = 'maze-examples';

    const variants = isSpiral
      ? SPIRAL_SEEDS.map((seed) => ({ key: String(seed), label: `Seed ${seed}` }))
      : ROOMS_MODE_VARIANTS.map((entry) => ({ key: entry.mode, label: entry.label }));

    const targets = variants.map((variant) => {
      const sampleEl = document.createElement('div');
      sampleEl.className = 'maze-sample';

      const labelEl = document.createElement('p');
      labelEl.className = 'sample-label';
      labelEl.textContent = variant.label;

      const sampleMazeEl = document.createElement('div');
      sampleMazeEl.className = 'maze';

      sampleEl.appendChild(labelEl);
      sampleEl.appendChild(sampleMazeEl);
      examplesEl.appendChild(sampleEl);

      return sampleMazeEl;
    });

    if (isSpiral) {
      spiralMazeTargets = targets;
    } else {
      roomsMazeTargets = targets;
    }

    mazeWrap.appendChild(examplesEl);
  }

  function generate(): void {
    const width = Math.max(2, Math.min(100, parseInt(wInput.value, 10) || 20));
    const height = Math.max(2, Math.min(100, parseInt(hInput.value, 10) || 15));
    wInput.value = String(width);
    hInput.value = String(height);

    if (isSpiral) {
      for (let i = 0; i < SPIRAL_SEEDS.length; i++) {
        const seed = SPIRAL_SEEDS[i];
        const matrix = generateMaze({ width, height, algorithm: algo, seed });
        const target = spiralMazeTargets[i];
        if (target !== undefined) {
          renderMaze(matrix, target);
        }
      }
      return;
    }

    if (isRoomsAndCorridors) {
      for (let i = 0; i < ROOMS_MODE_VARIANTS.length; i++) {
        const mode = ROOMS_MODE_VARIANTS[i]?.mode;
        const target = roomsMazeTargets[i];
        if (mode === undefined || target === undefined) {
          continue;
        }

        const matrix = generateMaze({
          width,
          height,
          algorithm: algo,
          roomsConnectionMode: mode,
        });
        renderMaze(matrix, target);
      }
      return;
    }

    const matrix = generateMaze({ width, height, algorithm: algo, fractalMode });
    renderMaze(matrix, mazeEl);
  }

  regenBtn.addEventListener('click', generate);

  // Regenerate when size inputs change (on blur to avoid mid-typing glitches).
  wInput.addEventListener('change', generate);
  hInput.addEventListener('change', generate);

  generate();
}

document.querySelectorAll<HTMLElement>('.card[data-algo]').forEach(initSection);
