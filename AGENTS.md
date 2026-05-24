# AI Agent Instructions: maze-builder

## Purpose
This is the core npm library for maze generation. It is responsible STRICTLY for mathematics, algorithms, and data structures. It is framework-agnostic, side-effect-free, and tree-shakeable.
Built with Vite (Library mode). Dual ESM/CJS output with automatic `.d.ts` declaration generation. Full TypeScript support with declaration files. High-coverage unit testing.


## Absolute Rules
- NEVER mix generation logic, rendering logic, and styling in the same module.
- NEVER import framework-specific code (React, Vue, etc.) into core modules.
- NEVER add side effects at module level.
- ALL public API changes must be reflected in TypeScript types and JSDoc.
- NEVER use `any` or `unknown` types. Be explicit with types everywhere.
- ALWAYS document time and space complexity in comments for all algorithms.
- ALWAYS use pure functions where possible. If state is necessary, it should be encapsulated and not exposed to the outside world.
- **No UI/DOM Elements:** You must never write code that imports or uses `document`, `window`, `canvas`, `React`, `Vue`, or any HTML/CSS elements.
- This core package should have zero runtime dependencies.

## Core Entities & Interfaces
When generating code, adhere to these conceptual data structures:
- **MazeConfig:** An interface accepting `width` (number), `height` (number), `algorithm` (enum), and optionally `format` (enum): The desired output format (e.g., `'matrix'`, `'graph'`).
- **Output Format:** Algorithms should output a standardized format. By default, a 2D numeric array (`number[][]`), where `0` represents a wall and `1` represents a path.
- **Pathfinder Output:** Solving algorithms should return an array of coordinates: `Array<{x: number, y: number}>`.

## Public API
- `Algorithm` currently includes `DFS`, `PRIMS`, `KRUSKALS`, `BINARY_TREE`, `WILSONS`, `ALDOUS_BRODER`, `ELLERS`, `SIDEWINDER`, `HUNT_AND_KILL`, `RECURSIVE_DIVISION`, `GROWING_TREE`, and `HOUSTONS`.
- `Format` currently includes `MATRIX` and `GRAPH`.
- `generateMaze()` returns `MazeMatrix` by default, or `MazeGraph` when called with `format: Format.GRAPH`.

## Architectural Patterns
- Use the **Strategy Pattern** for generating mazes. Different algorithms (DFS, Prim's, Kruskal's) must implement a common `IMazeGenerator` interface.

## Agent Role (@CoreArchitect)
When prompted under this domain, act as a strict Computer Science expert. Focus heavily on:
- Big O notation (time and space complexity).
- Memory efficiency (avoiding stack overflows on massive maze sizes).
- 100% strict TypeScript typing.

## Project Structure

```
src/
  algorithms/   # Maze generation algorithms (one file per algorithm)
  utils/         # Shared grid, graph, and random helpers
  index.ts       # Public API entry point
  types.ts       # Public enums, interfaces, and output types
```

## Dot-Folder Policy

Directories whose names begin with `.` (e.g. `.git`, `.github`, `.vscode`) are not considered part of the application code. This does not apply to files like `.env` which are part of the project environment.

- Do not search, read, or run anything inside a dot-folder unless explicitly asked.
- If a task could involve a dot-folder, ask the user whether that folder should be included in scope before proceeding.

## AI Skill Hints

At natural pause points — task start, task transition, or when the user asks an explicit question — mention the relevant skill once if the situation matches. Do not repeat a suggestion the user has already seen. Do not interrupt mid-task.

| Situation | Suggest |
|-----------|---------|
| User is about to implement a feature or fix | `/tdd` |
| User describes a bug or failing test | `/debug` |
| User asks what unfamiliar code does | `/explain` |
| User asks for a commit message | `/commit` |
| User finishes a branch and asks about merging | `/review-pr` |
| User discusses a significant architecture decision | `/adr` |
| User wants a quick security scan before merging | `/security-check` |
| User needs a structured plan before coding | `/plan` |
