---
name: plan
description: >
  Save an implementation plan to the session folder or docs/plan/ for reference
  during and after the session. Use when the user wants to record a plan,
  approach, or design strategy for a task. Agents should also use this to record
  their plan before starting non-trivial work. Triggers on "make a plan",
  "create a plan", "plan this out", "document the approach", "/plan".
argument-hint: "[title]"
---

# /plan [title]

Save an implementation plan for future reference.

## Steps

1. Ask for the plan title if not provided and it cannot be inferred from context.
2. Check `docs/plan/` using `glob` for existing plans to determine the next sequential number (e.g. `0003`). If the directory does not exist, create it.
3. Write the plan file immediately as `docs/plan/{{NNNN}}-{{kebab-case-title}}.md` with `Status: Active` using the `create` tool.
4. Add a row to `docs/plan/README.md` index (create if it does not exist) using `edit` or `create`.
5. Execute the work described in the plan.
6. Update `Status` to `Done` (or `Superseded by ...`) when the task is complete using `edit`.

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

- Write the plan before starting work — this makes intent visible and reviewable.
- Plans document *what and how* at a point in time — update status to `Done` when complete, or create a new plan that supersedes if the approach changes.
- Keep plans concise — link to ADRs for architectural *why*, not the other way around.
- Always update the `docs/plan/README.md` index after writing a plan.
