---
name: docs-consistency-review
description: Review README.md and AGENTS.md against the current codebase and update them only when they are out of sync.
argument-hint: Review README.md and AGENTS.md for consistency with the codebase.
---

# Docs Consistency Review

Review [README.md](README.md) and [AGENTS.md](AGENTS.md) against the current codebase, public API, scripts, tests, and repository conventions.

## Workflow

1. Build an authoritative inventory before comparing documentation. Enumerate the relevant tracked files, including `src/**/*.ts`, `tests/**/*.ts`, `sandbox/*.html`, and their nearby scripts/styles. Do not infer the complete project structure from the documents themselves.
2. Inspect the public API in [src/index.ts](src/index.ts) and [src/types.ts](src/types.ts), plus metadata, package scripts, and nearby implementation or test files needed to confirm behavior.
3. Reconcile every documented algorithm, output format, script, project-structure entry, sandbox page, and constraint with the code. For sandbox documentation, compare the README and AGENTS page lists against the complete `sandbox/*.html` inventory; inspect each page's module scripts or adjacent files when needed to identify its purpose. Flag documented entries that no longer exist and existing entries that are undocumented.
4. Update either document only when it is out of sync with the codebase.
5. Keep edits minimal, accurate, and consistent with the existing markdown tone and structure.
6. If no changes are needed, say so explicitly and summarize what was checked.

## Output

Return a brief summary that includes:
- What was checked
- What changed, if anything
- Any remaining mismatches or risks
- Validation performed, if any

## Guardrails

- Do not invent APIs, scripts, algorithms, or constraints.
- Treat filesystem inventories and exported/runtime registries as authoritative over existing documentation.
- Check for additions as well as removals; in particular, do not stop after confirming only the pages already listed in the docs.
- Prefer the smallest accurate documentation fix over a rewrite.
- Preserve the repository's existing markdown style.
- Keep the prompt focused on documentation maintenance only.