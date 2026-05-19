---
name: adr
description: Create an Architecture Decision Record (ADR) documenting a technical decision. Use when the user wants to document a technical decision, create an ADR, or record an architectural choice.
argument-hint: [title]
allowed-tools: Read, Glob, Write
effort: low
---

# /adr [title]

Create an Architecture Decision Record (ADR) documenting a technical decision.

## Steps

1. Ask for the decision title if not provided
2. Check `docs/adr/` (or `docs/decisions/`) for existing ADRs to determine:
   - The next sequential number (e.g. `0012`)
   - The format already in use — match it exactly
3. If no ADRs exist, create the directory `docs/adr/` and use the format below
4. Draft the ADR and show it to the user for review before writing
5. Write the file as `docs/adr/{{NNNN}}-{{kebab-case-title}}.md`
6. Ask if the decision should be linked from `README.md` or a docs index

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
- Keep ADRs immutable once accepted — if a decision changes, create a new ADR that supersedes the old one
- Mark the old ADR status as `Superseded by [ADR-XXXX]`
- ADRs document the *why*, not the *how* — the code documents the how

## Alternative: Superpowers Workflow (Agents)

For complex decisions that need design exploration before being recorded, agents can optionally run `superpowers:brainstorming` first. That skill guides structured trade-off analysis across 2-3 approaches and produces an approved design spec — use it as input for the Context and Alternatives Considered sections of the ADR.
