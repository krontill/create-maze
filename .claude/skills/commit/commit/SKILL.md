---
name: commit
description: Stage changed files and create a well-formed commit following Conventional Commits. Use when the user wants to commit, stage files, or create a git commit message.
argument-hint: []
allowed-tools: Bash
effort: low
---

# /commit

Stage changed files and create a well-formed commit following Conventional Commits.

## Steps

1. Run `git status` to see what is changed and untracked
2. Run `git diff` (staged and unstaged) to understand what changed and why
3. Run `git log --oneline -10` to match this repo's existing commit style
4. Ask the user which files to stage if it is not obvious from context — never silently `git add -A`
5. Stage the selected files
6. Draft a commit message:
   - First line: `<type>(<optional scope>): <short imperative summary>` — max 72 chars
   - Valid types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`
   - Leave a blank line, then add a short body if the change needs explanation (the *why*, not the *what*)
7. Show the draft message to the user and ask for approval or edits before committing
8. Create the commit using a HEREDOC to preserve formatting
9. Run `git status` to confirm success

## Rules
- Never use `git add -A` or `git add .` without explicit user approval
- Never amend an existing commit — always create a new one
- Never skip hooks (`--no-verify`)
- Do not commit files that likely contain secrets (`.env`, `*.pem`, `credentials.*`)
- If a pre-commit hook fails, fix the underlying issue and create a fresh commit; do not re-amend
