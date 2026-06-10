---
name: add-algorithm-skill-review
description: Review the add-algorithm skill against the current codebase and update it only when it is out of sync.
argument-hint: Review .agents/skills/add-algorithm/SKILL.md for consistency with the codebase.
---

# Add-Algorithm Skill Consistency Review

Review [.agents/skills/add-algorithm/SKILL.md](.agents/skills/add-algorithm/SKILL.md) against the current codebase and update it only when it is out of sync.

## Workflow

1. Inspect the authoritative sources:
   - [src/types.ts](src/types.ts) — `Algorithm` enum members, `MazeConfig` fields, `Format` enum, exported interfaces (`IMazeGenerator`, `MazeMatrix`, `MazeGraph`)
   - [src/index.ts](src/index.ts) — `GENERATORS` record shape, public API exports (`generateMaze`, `generateMazeSteps`)
   - [src/utils/grid.ts](src/utils/grid.ts) — available grid helpers and their signatures (`createGrid`, `markCell`, `carvePassage`, coordinate system)
   - [src/utils/random.ts](src/utils/random.ts) — PRNG helpers (`createRandom`, `shuffle`) and their signatures
   - [tests/helpers.ts](tests/helpers.ts) — test utility functions available for algorithm tests (e.g. `isFullyConnected`)
   - [sandbox/index.html](sandbox/index.html) — card HTML structure, attributes, and controls layout
   - [sandbox/compare.ts](sandbox/compare.ts) — `ALGORITHMS` list shape and `AlgorithmDef` type

2. Compare each of the seven skill steps against what the code actually contains:
   - **Step 1** — Does the enum example in the skill reflect current `Algorithm` members and value casing?
   - **Step 2** — Do the canonical imports, helper call signatures, and coordinate system description match `src/utils/grid.ts` and `src/utils/random.ts`?
   - **Step 3** — Does the `GENERATORS` record example match the actual shape in `src/index.ts`?
   - **Step 4** — Do the test imports, helpers used, and minimum test surface match current test conventions and `tests/helpers.ts`?
   - **Step 5** — Does the demo card HTML template match the current structure in `sandbox/index.html`?
   - **Step 6** — Does the `ALGORITHMS` list example match the current shape of `AlgorithmDef` in `sandbox/compare.ts`?
   - **Step 7** — Are the verification commands (`pnpm test`, `pnpm build`) still correct per `package.json`?

3. Compare the **Architecture constraints** and **Implementation checklist** sections against the rules in [AGENTS.md](AGENTS.md) and actual project conventions.

4. Update [.agents/skills/add-algorithm/SKILL.md](.agents/skills/add-algorithm/SKILL.md) only where it is out of sync with the codebase.

5. Keep edits minimal, accurate, and consistent with the existing skill tone and structure.

6. If no changes are needed, say so explicitly and summarize what was checked.

## Output

Return a brief summary that includes:
- What was checked
- What changed, if anything
- Any remaining mismatches or risks
- Validation performed, if any

## Guardrails

- Do not invent helpers, interfaces, enum members, or conventions that do not exist in the codebase.
- Prefer the smallest accurate skill fix over a rewrite.
- Preserve the existing skill markdown style, section order, and code block formatting.
- Keep the prompt focused on skill maintenance only — do not modify source files or tests.
