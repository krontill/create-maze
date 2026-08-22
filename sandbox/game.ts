import { generateMaze, Algorithm, Format } from '../src/index';
import type { MazeMatrix } from '../src/index';

// ── Constants ─────────────────────────────────────────────────────────────

const CELL_PX = 22;
const DEFAULT_WIDTH = 15;
const DEFAULT_HEIGHT = 10;

// ── DOM refs ──────────────────────────────────────────────────────────────

const mazeEl = document.getElementById('maze') as HTMLDivElement;
const widthInput = document.getElementById('inp-width') as HTMLInputElement;
const heightInput = document.getElementById('inp-height') as HTMLInputElement;
const newMazeBtn = document.getElementById('btn-new-maze') as HTMLButtonElement;
const statusLine = document.getElementById('status-line') as HTMLParagraphElement;
const winBanner = document.getElementById('win-banner') as HTMLDivElement;
const playAgainBtn = document.getElementById('btn-play-again') as HTMLButtonElement;

// ── State ─────────────────────────────────────────────────────────────────

let matrix: MazeMatrix = [];
let width = DEFAULT_WIDTH;
let height = DEFAULT_HEIGHT;
// Hero/finish positions are tracked directly in matrix space (raw grid
// squares, including the connector passages between cell centers) so that
// each arrow-key press moves the Hero exactly one rendered square.
let heroRow = 0;
let heroCol = 0;
let finishRow = 0;
let finishCol = 0;
let hasWon = false;

// ── Helpers ───────────────────────────────────────────────────────────────

function getWidth(): number {
  return Math.max(2, Math.min(60, parseInt(widthInput.value, 10) || DEFAULT_WIDTH));
}

function getHeight(): number {
  return Math.max(2, Math.min(60, parseInt(heightInput.value, 10) || DEFAULT_HEIGHT));
}

/** Whether the adjacent matrix square is in bounds and passable. */
function canMove(toRow: number, toCol: number): boolean {
  return matrix[toRow]?.[toCol] === 1;
}

// ── Rendering ─────────────────────────────────────────────────────────────

function renderMaze(): void {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  mazeEl.style.gridTemplateColumns = `repeat(${cols}, ${CELL_PX}px)`;
  mazeEl.style.gridTemplateRows = `repeat(${rows}, ${CELL_PX}px)`;

  const needed = rows * cols;
  while (mazeEl.children.length < needed) {
    mazeEl.appendChild(document.createElement('div'));
  }
  while (mazeEl.children.length > needed) {
    mazeEl.removeChild(mazeEl.lastChild!);
  }

  let idx = 0;
  for (let r = 0; r < rows; r++) {
    const row = matrix[r]!;
    for (let c = 0; c < cols; c++) {
      const cell = mazeEl.children[idx] as HTMLElement;
      const isPath = row[c] === 1;
      if (r === heroRow && c === heroCol) {
        cell.className = 'hero';
      } else if (r === finishRow && c === finishCol) {
        cell.className = 'finish';
      } else {
        cell.className = isPath ? 'path' : 'wall';
      }
      idx++;
    }
  }
}

// ── Game lifecycle ────────────────────────────────────────────────────────

function newMaze(): void {
  width = getWidth();
  height = getHeight();
  widthInput.value = String(width);
  heightInput.value = String(height);

  matrix = generateMaze({
    width,
    height,
    algorithm: Algorithm.ELLERS,
    format: Format.MATRIX,
    seed: Date.now(),
  });

  // Start/finish sit exactly on the maze's border openings — the entrance
  // on the left edge of the top row, the exit on the right edge of the
  // bottom row (see utils/grid.ts createGrid()).
  heroRow = 1;
  heroCol = 0;
  finishRow = 2 * height - 1;
  finishCol = 2 * width;
  hasWon = false;

  winBanner.classList.remove('visible');
  statusLine.textContent = 'Use the arrow keys to move. Reach the green exit to win!';

  renderMaze();
}

function checkWin(): void {
  if (heroRow === finishRow && heroCol === finishCol) {
    hasWon = true;
    winBanner.classList.add('visible');
    statusLine.textContent = 'Solved!';
  }
}

function tryMove(dRow: number, dCol: number): void {
  if (hasWon) return;
  const toRow = heroRow + dRow;
  const toCol = heroCol + dCol;
  if (!canMove(toRow, toCol)) return;
  heroRow = toRow;
  heroCol = toCol;
  renderMaze();
  checkWin();
}

// ── Event listeners ───────────────────────────────────────────────────────

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      tryMove(-1, 0);
      break;
    case 'ArrowDown':
      event.preventDefault();
      tryMove(1, 0);
      break;
    case 'ArrowLeft':
      event.preventDefault();
      tryMove(0, -1);
      break;
    case 'ArrowRight':
      event.preventDefault();
      tryMove(0, 1);
      break;
    default:
      break;
  }
});

newMazeBtn.addEventListener('click', () => { newMaze(); });
playAgainBtn.addEventListener('click', () => { newMaze(); });

// ── Init ──────────────────────────────────────────────────────────────────

newMaze();
