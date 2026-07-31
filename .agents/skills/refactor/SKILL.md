---
name: refactor
description: >
  Surgical code refactoring to improve maintainability without changing behavior.
  Covers extracting functions, renaming variables, breaking down god functions,
  improving type safety, eliminating code smells, and applying design patterns.
  Less drastic than repo-rebuilder; use for gradual improvements.
  Use this skill whenever the user says "refactor", "clean up", "extract",
  "rename", "too complex", "hard to read", "improve readability", "break this
  apart", "simplify", "code smell", or wants incremental code quality improvements
  without changing what the code does. Also triggers when reviewing a file and
  noticing obvious structural or naming issues worth fixing proactively.
---

# Refactor

Surgical improvements to code structure, naming, and clarity — without changing observable behavior.

The goal is to leave the code in a state where the next person (or future you) can read it quickly, reason about it confidently, and extend it without fear. Changes must be safe: tests pass before and after, and nothing external breaks.

## When to use this skill

Use for **gradual, targeted improvements** — not full rewrites. If the user wants to redesign the architecture, change the public API, or replace a module entirely, that is out of scope here. Think of refactoring as polishing, not rebuilding.

Common triggers:
- Function is too long and does several unrelated things
- Variable or parameter names are cryptic or misleading
- Logic is duplicated across multiple places
- Type annotations are missing or imprecise
- A class or file has grown into a "god object"
- Control flow is deeply nested and hard to follow
- A magic constant needs a named variable

## Workflow

### 1. Understand before touching

Read the target code carefully. Understand what it does and why it exists. Check whether there are tests covering it — if not, note the risk and consider writing a minimal test first.

Establish a green baseline — run the existing tests with the `powershell` tool:

```powershell
pnpm test
```

Never start editing code that is already in a failing state.

### 2. Identify the improvement

Be specific about what you're changing and why. One improvement at a time is safer and easier to review than a big-bang refactor. Good improvements are:

- **Extracting a function** — when a block of code is doing a distinct sub-task and would be clearer with a name
- **Renaming** — when the name doesn't match what the thing actually does
- **Eliminating duplication** — when the same logic appears in two or more places; unify into a shared helper
- **Flattening nesting** — when deeply nested conditionals can be inverted (early return / guard clause) to reduce indentation
- **Improving types** — replacing loose types with narrower ones; adding generics; removing `any` or `unknown`
- **Splitting a large function** — when a function does multiple conceptually separate things

### 3. Make the change

Apply edits with the `edit` tool. Keep each change focused. If you find yourself touching 5+ unrelated things, stop and complete them in separate passes.

**maze-builder specific rules** (always enforce):
- No `any` or `unknown` — be explicit with types everywhere
- No side effects at module level
- If refactoring algorithm code, preserve the JSDoc time/space complexity comment; update it if the complexity changes
- Prefer pure functions; if state is needed, encapsulate it inside the class method
- Do not import framework code (`document`, `window`, `canvas`, `React`, `Vue`) — core is framework-agnostic
- After renaming a public API symbol, update `src/types.ts`, `src/index.ts`, and any re-exports

### 4. Verify

After changes, run with `powershell` tool:

```powershell
pnpm test    # all tests must still pass
pnpm build   # no new type errors
```

If tests break, fix them before moving on — unless the test itself was testing an implementation detail that no longer exists. In that case, update the test and explain why.

### 5. Summarize

Tell the user:
- What you changed and where
- Why the change improves the code
- Whether there are follow-up opportunities worth noting

## Patterns and examples

### Extract function

**Before:**
```typescript
// Buried inside a 60-line method
const visited = new Set<string>();
const queue = [start];
while (queue.length) {
  const curr = queue.shift()!;
  if (visited.has(curr)) continue;
  visited.add(curr);
}
```

**After:**
```typescript
function bfsTraverse(start: string, neighbors: (node: string) => string[]): Set<string> {
  const visited = new Set<string>();
  const queue = [start];
  while (queue.length) {
    const curr = queue.shift()!;
    if (visited.has(curr)) continue;
    visited.add(curr);
    for (const n of neighbors(curr)) queue.push(n);
  }
  return visited;
}
```

### Guard clause (flatten nesting)

**Before:**
```typescript
function process(config: MazeConfig) {
  if (config.width > 0) {
    if (config.height > 0) {
      // actual logic
    }
  }
}
```

**After:**
```typescript
function process(config: MazeConfig) {
  if (config.width <= 0) return;
  if (config.height <= 0) return;
  // actual logic
}
```

### Improve type precision

**Before:**
```typescript
function getGenerator(algorithm: string): any {
  return GENERATORS[algorithm];
}
```

**After:**
```typescript
function getGenerator(algorithm: Algorithm): IMazeGenerator {
  return GENERATORS[algorithm];
}
```

### Name a magic constant

**Before:**
```typescript
const grid = new Array(2 * height + 1).fill(null).map(() => new Array(2 * width + 1).fill(0));
```

**After:**
```typescript
const GRID_ROWS = 2 * height + 1;
const GRID_COLS = 2 * width + 1;
const grid = Array.from({ length: GRID_ROWS }, () => new Array(GRID_COLS).fill(0));
```

## What NOT to do

- Do not change public API signatures unless the user explicitly asks — consumers may depend on them
- Do not rewrite working logic just because you would have written it differently — only refactor if there is a concrete readability or maintainability gain
- Do not add comments explaining *what* the code does — prefer self-explanatory naming; comments should explain *why* when the reason isn't obvious
- Do not introduce new dependencies
- Do not mix refactoring with feature additions in the same pass — it makes the diff harder to review
