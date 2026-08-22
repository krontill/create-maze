import { generateMaze, Algorithm, Format } from '../src/index';
import type { MazeMatrix } from '../src/index';
import { getNextCanvasPosition } from './game-canvas-movement';
import type { CanvasPosition } from './game-canvas-movement';

const CELL_PX = 22;
const DEFAULT_WIDTH = 15;
const DEFAULT_HEIGHT = 10;
const COLORS = {
  wall: '#1e1e2e',
  path: '#f0ede8',
  finish: '#4caf6a',
  hero: '#e6483c',
  heroBorder: '#7a1a12',
} as const;

const canvas = document.getElementById('canvas-maze') as HTMLCanvasElement;
const widthInput = document.getElementById('canvas-inp-width') as HTMLInputElement;
const heightInput = document.getElementById('canvas-inp-height') as HTMLInputElement;
const newMazeButton = document.getElementById('canvas-btn-new-maze') as HTMLButtonElement;
const statusLine = document.getElementById('canvas-status-line') as HTMLParagraphElement;
const winBanner = document.getElementById('canvas-win-banner') as HTMLDivElement;
const playAgainButton = document.getElementById('canvas-btn-play-again') as HTMLButtonElement;
const context = canvas.getContext('2d');

if (context === null) {
  throw new Error('Canvas 2D rendering is not supported by this browser.');
}

let matrix: MazeMatrix = [];
let width = DEFAULT_WIDTH;
let height = DEFAULT_HEIGHT;
let hero: CanvasPosition = { row: 1, col: 0 };
let finish: CanvasPosition = { row: 0, col: 0 };
let hasWon = false;

function getDimension(input: HTMLInputElement, fallback: number): number {
  return Math.max(2, Math.min(60, parseInt(input.value, 10) || fallback));
}

function drawMaze(): void {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  canvas.width = cols * CELL_PX;
  canvas.height = rows * CELL_PX;

  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      context.fillStyle = matrix[row]![col] === 1 ? COLORS.path : COLORS.wall;
      context.fillRect(col * CELL_PX, row * CELL_PX, CELL_PX, CELL_PX);
    }
  }

  context.fillStyle = COLORS.finish;
  context.fillRect(finish.col * CELL_PX, finish.row * CELL_PX, CELL_PX, CELL_PX);
  context.fillStyle = COLORS.hero;
  context.fillRect(hero.col * CELL_PX, hero.row * CELL_PX, CELL_PX, CELL_PX);
  context.strokeStyle = COLORS.heroBorder;
  context.lineWidth = 2;
  context.strokeRect(
    hero.col * CELL_PX + 1,
    hero.row * CELL_PX + 1,
    CELL_PX - 2,
    CELL_PX - 2,
  );
}

function newMaze(): void {
  width = getDimension(widthInput, DEFAULT_WIDTH);
  height = getDimension(heightInput, DEFAULT_HEIGHT);
  widthInput.value = String(width);
  heightInput.value = String(height);
  matrix = generateMaze({
    width,
    height,
    algorithm: Algorithm.ELLERS,
    format: Format.MATRIX,
    seed: Date.now(),
  });
  hero = { row: 1, col: 0 };
  finish = { row: 2 * height - 1, col: 2 * width };
  hasWon = false;
  winBanner.classList.remove('visible');
  statusLine.textContent = 'Click the canvas, then use the arrow keys to move.';
  drawMaze();
}

function tryMove(deltaRow: number, deltaCol: number): void {
  if (hasWon) return;
  const next = getNextCanvasPosition(matrix, hero.row, hero.col, deltaRow, deltaCol);
  if (next === null) return;
  hero = next;
  drawMaze();
  if (hero.row === finish.row && hero.col === finish.col) {
    hasWon = true;
    winBanner.classList.add('visible');
    statusLine.textContent = 'Solved!';
  }
}

canvas.addEventListener('keydown', (event) => {
  const movement: Record<string, CanvasPosition> = {
    ArrowUp: { row: -1, col: 0 },
    ArrowDown: { row: 1, col: 0 },
    ArrowLeft: { row: 0, col: -1 },
    ArrowRight: { row: 0, col: 1 },
  };
  const delta = movement[event.key];
  if (delta === undefined) return;
  event.preventDefault();
  tryMove(delta.row, delta.col);
});

newMazeButton.addEventListener('click', newMaze);
playAgainButton.addEventListener('click', newMaze);
newMaze();
