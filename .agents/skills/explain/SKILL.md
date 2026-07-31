---
name: explain
description: >
  Produce a structured walkthrough of unfamiliar code. Use when onboarding to
  a codebase, reading code written by others, or trying to understand what a
  module, function, or file does before modifying it. Triggers on "explain",
  "what does this do", "how does this work", "walk me through", "understand this code".
argument-hint: "[file, function, or module to explain]"
---

# /explain [target]

Explain what code does in plain language.

## Steps

1. Read the target code using the `view` tool. Ask the user to specify it if not clear from context.
2. Summarize what the code does in one plain-language paragraph — no jargon, no implementation detail.
3. Walk through the key components in order:
   - **Inputs**: what data or arguments does it receive?
   - **Outputs**: what does it return, emit, or write?
   - **Side effects**: does it modify state, call external services, or write to disk?
   - **Dependencies**: what does it rely on (imports, injected services, env vars)?
4. Note anything non-obvious: unusual patterns, performance implications, gotchas, or things that look wrong but are intentional.

## Rules

- Do not suggest changes unless the user explicitly asks.
- Focus on what exists, not what should exist.
- If the code has a bug or smell worth mentioning, note it briefly at the end — but do not turn the explanation into a code review.

## Useful tools

- `view` — read file contents
- `grep` — search for symbol usages across the codebase
- `glob` — find related files by pattern
