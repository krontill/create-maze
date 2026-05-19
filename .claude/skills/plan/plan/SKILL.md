---
name: plan
description: Save an implementation plan to docs/plan/ for reference during and after the session. Use when the user wants to record a plan, approach, or design strategy for a task. Agents should also use this to record their plan before starting non-trivial work.
argument-hint: [title]
allowed-tools: Read, Glob, Write, Bash
effort: low
---

# /plan [title]

Save an implementation plan to `docs/plan/` for future reference.

## Steps

1. Ask for the plan title if not provided and it cannot be inferred from context
2. Check `docs/plan/` for existing plans to determine the next sequential number (e.g. `0003`)
3. Write the plan file immediately as `docs/plan/{{NNNN}}-{{kebab-case-title}}.md` with `Status: Active`
4. Add a row to `docs/plan/README.md` index (create if it does not exist)
5. Execute the work described in the plan
6. Update `Status` to `Done` (or `Superseded by ...`) when the task is complete

## Plan Format

```markdown
# {{NNNN}}. {{Title}}

Date: {{YYYY-MM-DD}}
Status: Draft | Active | Done | Superseded by [PLAN-XXXX](XXXX-title.md)
Author: [your name or agent name]

## Goal

What outcome does this plan achieve?

## Approach

Step-by-step description of the implementation strategy.

## Open Questions

Any unknowns or decisions still to be made.

## Out of Scope

What this plan deliberately does not cover.
```

## Rules

- Write the plan before starting work — this makes intent visible and reviewable
- Plans document *what and how* at a point in time — update status to `Done` when complete, or create a new plan that supersedes if the approach changes
- Keep plans concise — link to ADRs for architectural *why*, not the other way around
- Always update the `docs/plan/README.md` index after writing a plan

## Alternative: Superpowers Workflow (Agents)

For non-trivial features, agents can optionally use the more rigorous superpowers workflow instead:

1. `superpowers:brainstorming` — explores requirements and produces an approved design spec before any implementation begins
2. `superpowers:writing-plans` — produces an agent-executable plan with actual code, exact file paths, exact commands, and TDD steps per task (no placeholders allowed)

Use superpowers when the task spans multiple files or requires design decisions upfront. Use this skill for quick, lightweight planning notes.
