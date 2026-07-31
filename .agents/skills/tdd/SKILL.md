---
name: tdd
description: >
  Guide a test-driven development cycle for any feature or fix. Use when
  starting implementation of any new behavior. Write the failing test first,
  then the minimal code to pass it. Use this skill whenever the user wants
  to implement a new feature, fix a bug with tests, or follow a red-green-refactor
  workflow — even if they don't explicitly say "TDD".
argument-hint: "[unit or feature to implement]"
---

# /tdd [unit or feature]

Drive implementation through failing tests.

## Steps

1. Identify the unit under test — ask the user if it is not clear from context.
2. Read any existing tests in the project to understand the test framework and naming conventions in use.
3. Write a failing test that captures the expected behavior. Keep it minimal: one behavior per test.
4. Run the test with the `powershell` tool and confirm it fails for the right reason (not a syntax error or import problem):
   ```powershell
   pnpm test
   ```
5. Write the minimal implementation code to make the test pass. Do not write more than needed.
6. Run the test again and confirm it passes.
7. Refactor the implementation if needed, keeping all tests green after each change.
8. Repeat from Step 3 for the next behavior.

## Rules

- Never write implementation code before at least one failing test exists.
- Use the project's existing test framework and file/naming conventions — do not introduce a new test library.
- One behavior per test. If a test is testing two things, split it.
- Refactor only after tests pass — never during red or green phases simultaneously.

## maze-builder conventions

- Test files live in `tests/` and are named `<algo>.test.ts`
- Import only from the public API (`../src/index`) in tests
- Use the `isFullyConnected` helper from `./helpers` for maze connectivity checks
- Run with `pnpm test` (Vitest); build check with `pnpm build`
