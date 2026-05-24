---
name: docs-consistency-review
description: Review README.md and AGENTS.md against the current codebase and update them only when they are out of sync.
argument-hint: Review README.md and AGENTS.md for consistency with the codebase.
---

# Docs Consistency Review

Review [README.md](README.md) and [AGENTS.md](AGENTS.md) against the current codebase, public API, scripts, tests, and repository conventions.

## Workflow

1. Inspect the public API in [src/index.ts](src/index.ts) and [src/types.ts](src/types.ts), plus any nearby implementation or test files needed to confirm behavior.
2. Compare the documented algorithms, output formats, scripts, project structure, and constraints with what the code actually exports and supports.
3. Update either document only when it is out of sync with the codebase.
4. Keep edits minimal, accurate, and consistent with the existing markdown tone and structure.
5. If no changes are needed, say so explicitly and summarize what was checked.

## Output

Return a brief summary that includes:
- What was checked
- What changed, if anything
- Any remaining mismatches or risks
- Validation performed, if any

## Guardrails

- Do not invent APIs, scripts, algorithms, or constraints.
- Prefer the smallest accurate documentation fix over a rewrite.
- Preserve the repository's existing markdown style.
- Keep the prompt focused on documentation maintenance only.