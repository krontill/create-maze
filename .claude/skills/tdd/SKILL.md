---
name: tdd
description: Guide a test-driven development cycle for any feature or fix. Use when starting implementation of any new behavior. Write the failing test first, then the minimal code to pass it.
argument-hint: [unit or feature to implement]
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
effort: high
---

# /tdd [unit or feature]

Drive implementation through failing tests.

## Steps

1. Identify the unit under test — ask the user if it is not clear from context.
2. Read any existing tests in the project to understand the test framework and naming conventions in use.
3. Write a failing test that captures the expected behavior. Keep it minimal: one behavior per test.
4. Run the test and confirm it fails for the right reason (not a syntax error or import problem).
5. Write the minimal implementation code to make the test pass. Do not write more than needed.
6. Run the test again and confirm it passes.
7. Refactor the implementation if needed, keeping all tests green after each change.
8. Repeat from Step 3 for the next behavior.

## Rules

- Never write implementation code before at least one failing test exists.
- Use the project's existing test framework and file/naming conventions — do not introduce a new test library.
- One behavior per test. If a test is testing two things, split it.
- Refactor only after tests pass — never during red or green phases simultaneously.
