import { generateMaze, Algorithm } from '../src/index';
import type { MazeMatrix } from '../src/index';

const CELL_PX = 8;

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
  const wInput = section.querySelector<HTMLInputElement>('.w-input')!;
  const hInput = section.querySelector<HTMLInputElement>('.h-input')!;
  const regenBtn = section.querySelector<HTMLButtonElement>('.regen-btn')!;
  const mazeEl = section.querySelector<HTMLElement>('.maze')!;

  function generate(): void {
    const width = Math.max(2, Math.min(100, parseInt(wInput.value, 10) || 20));
    const height = Math.max(2, Math.min(100, parseInt(hInput.value, 10) || 15));
    wInput.value = String(width);
    hInput.value = String(height);

    const matrix = generateMaze({ width, height, algorithm: algo });
    renderMaze(matrix, mazeEl);
  }

  regenBtn.addEventListener('click', generate);

  // Regenerate when size inputs change (on blur to avoid mid-typing glitches).
  wInput.addEventListener('change', generate);
  hInput.addEventListener('change', generate);

  generate();
}

document.querySelectorAll<HTMLElement>('.card[data-algo]').forEach(initSection);
