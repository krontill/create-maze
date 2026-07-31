---
name: review-pr
description: >
  Run a thorough AI-assisted review of the current branch against its base branch.
  Use when the user wants to review a PR, check code before merging, or get a
  structured code review. Triggers on "review PR", "review this branch",
  "check before merging", "code review", "review my changes".
---

# /review-pr

Run a thorough AI-assisted review of the current branch against its base branch.

## Steps

1. Identify the base branch using the `powershell` tool: run `git --no-pager log --oneline -1` then check `git remote show origin` and default to `main` / `master`.
2. Run `git --no-pager log <base>...HEAD --oneline` to list commits in this PR.
3. Run `git --no-pager diff <base>...HEAD` to get the full diff.
4. Read any files that changed significantly using the `view` tool to understand context beyond the diff.
5. If the PR has no description yet, generate one using `review-pr/pr-template.md` as the structure — fill in each section from the diff and commit history.
6. Produce a structured review report (see format below).
7. If blockers are found, list them first and ask the user how to proceed.

## Review Report Format

```
## PR Review: <branch name>

### Summary
One paragraph describing what this PR does and why.

### Checklist
- [ ] Code follows project conventions
- [ ] No obvious logic bugs
- [ ] Error cases are handled appropriately
- [ ] No hardcoded secrets or credentials
- [ ] Tests cover the new/changed behaviour
- [ ] No dead code or debug statements left in
- [ ] Public API / interface changes are documented

### Findings

#### Blockers
> Must be fixed before merging.
<list or "None">

#### Suggestions
> Non-blocking improvements worth considering.
<list or "None">

#### Nitpicks
> Style, naming, minor readability.
<list or "None">

### Verdict
APPROVE | REQUEST CHANGES | NEEDS DISCUSSION
```

## Rules

- Be specific: quote the file name and line number for every finding.
- Do not flag things already addressed by the project's linter/formatter.
- Do not suggest adding abstractions unless the code is genuinely duplicated.
- Security findings always go in Blockers regardless of severity perception.

## Resources

- `review-pr/pr-template.md` — PR description template; read it when generating a PR description.
