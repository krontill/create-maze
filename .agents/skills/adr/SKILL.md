---
name: adr
description: >
  Create an Architecture Decision Record (ADR) documenting a technical decision.
  Use when the user wants to document a technical decision, create an ADR, or
  record an architectural choice. Triggers on "ADR", "architecture decision",
  "document this decision", "record why we chose".
argument-hint: "[title]"
---

# /adr [title]

Create an Architecture Decision Record (ADR) documenting a technical decision.

## Steps

1. Ask for the decision title if not provided.
2. Check `docs/adr/` (or `docs/decisions/`) using `glob` for existing ADRs to determine:
   - The next sequential number (e.g. `0012`)
   - The format already in use — match it exactly
3. If no ADRs exist, create the directory with the `create` tool and use the format below.
4. Draft the ADR and show it to the user for review before writing.
5. Write the file as `docs/adr/{{NNNN}}-{{kebab-case-title}}.md` using the `create` tool.
6. Ask if the decision should be linked from `README.md` or a docs index.

## ADR Format

```markdown
# {{NNNN}}. {{Title}}

Date: {{YYYY-MM-DD}}
Status: Proposed | Accepted | Deprecated | Superseded by [ADR-XXXX](XXXX-title.md)

## Context

What situation or problem is this decision addressing? What forces are at play?

## Decision

What have we decided to do?

## Consequences

What becomes easier or harder as a result of this decision?
List both positive and negative consequences.

## Alternatives Considered

What other options were evaluated and why were they rejected?
```

## Rules

- Keep ADRs immutable once accepted — if a decision changes, create a new ADR that supersedes the old one.
- Mark the old ADR status as `Superseded by [ADR-XXXX]`.
- ADRs document the *why*, not the *how* — the code documents the how.
