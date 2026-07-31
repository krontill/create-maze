---
name: changelog
description: >
  Generate a human-readable changelog from git history. Use when the user wants
  to generate or write a changelog, release notes, or summarize recent commits.
  Triggers on "changelog", "release notes", "what changed", "summarize commits".
argument-hint: "[since]"
---

# /changelog [since]

Generate a human-readable changelog from git history.

## Steps

1. Determine the range using the `powershell` tool:
   - If `since` was provided (tag, branch, or commit), use `git log <since>...HEAD`
   - Otherwise find the latest tag with `git --no-pager describe --tags --abbrev=0` and use that as the base
   - If no tags exist, use the last 50 commits
2. Run `git --no-pager log <range> --pretty=format:"%h %s (%an)" --no-merges`
3. Group commits by Conventional Commit type:
   - `feat` → Features
   - `fix` → Bug Fixes
   - `perf` → Performance
   - `refactor` → Refactoring
   - `docs` → Documentation
   - `test` → Tests
   - `chore` / `ci` / `build` → Maintenance
   - Unclassified → Other Changes
4. Write the formatted changelog to the user (do NOT write to file unless asked).
5. Ask: "Write to CHANGELOG.md?" — prepend to existing file if confirmed, using the `edit` tool.

## Output Format

```markdown
## [Unreleased] — {{YYYY-MM-DD}}

### Features
- Short description of what changed (#commit-hash)

### Bug Fixes
- ...

### Maintenance
- ...
```

## Rules

- Omit merge commits.
- Omit commits with messages like `wip`, `fixup`, `tmp`, `typo` unless they are the only changes.
- De-duplicate entries that clearly describe the same change across multiple commits.
- Scope tags from Conventional Commits (`feat(auth):`) should be retained in the entry.
