---
name: review-pr
description: Run a thorough AI-assisted review of the current branch against its base branch. Use when the user wants to review a PR, check code before merging, or get a structured code review.
argument-hint: []
allowed-tools: Bash, Read, Glob, Grep
---

# /review-pr

Run a thorough AI-assisted review of the current branch against its base branch.

## Steps

1. Identify the base branch: check `git remote show origin` and default to `main` / `master`
2. Run `git log <base>...HEAD --oneline` to list commits in this PR
3. Run `git diff <base>...HEAD` to get the full diff
4. Read any files that changed significantly to understand context beyond the diff
5. Check the linked issue / ticket if a URL is available in CLAUDE.md or the branch name
6. If the PR has no description yet, generate one using `skills/review-pr/pr-template.md` as the structure — fill in each section from the diff and commit history
7. Produce a structured review report (see format below)
8. If blockers are found, list them first and ask the user how to proceed

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
- [ ] Database migrations are safe (no destructive changes without a rollback plan)
- [ ] No N+1 queries or obvious performance regressions
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
- Be specific: quote the file name and line number for every finding
- Do not flag things already addressed by the project's linter/formatter
- Do not suggest adding abstractions unless the code is genuinely duplicated
- Security findings always go in Blockers regardless of severity perception

> **Tip:** To automatically push fixes in response to CI failures or review comments on an open PR, use the built-in `/autofix-pr` command instead of this skill.
