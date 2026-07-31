---
name: debug
description: >
  Systematically diagnose and fix unexpected behavior or failing tests. Use
  when something is broken and the cause is not immediately obvious. Reproduce
  first, fix last. Triggers on "debug", "broken", "not working", "failing test",
  "error", "exception", "why does this", or when the user describes unexpected behavior.
argument-hint: "[description of the problem]"
---

# /debug [problem description]

Diagnose and fix the root cause of unexpected behavior.

## Steps

1. Reproduce the problem with a minimal, reliable case. If you cannot reproduce it, stop and ask the user for more context.
2. Isolate the failure: narrow down to the smallest code path that triggers it (remove variables until the problem still occurs).
3. State a hypothesis about the root cause. Write it down explicitly before proceeding.
4. Verify or disprove the hypothesis by reading or running code — do not change behavior yet. Use `view` and `grep` to read code, `powershell` to run tests:
   ```powershell
   pnpm test
   ```
5. If disproven, revise the hypothesis and repeat Step 4.
6. Once the root cause is confirmed, document what was found (one sentence is enough).
7. Apply the minimal fix using the `edit` tool. Confirm the reproduction case now passes.
8. Check that no existing tests are broken.

## Rules

- Do not change code until the root cause is confirmed (Step 6 complete).
- Never apply a workaround that hides the symptom without fixing the cause.
- If the reproduction case cannot be made reliable, say so — do not guess at causes.
