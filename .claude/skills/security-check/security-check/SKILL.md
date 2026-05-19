---
name: security-check
description: Review changed files for security vulnerabilities before merging or deploying. Use when the user wants a security review, vulnerability scan, or OWASP check on changed code.
argument-hint: []
allowed-tools: Bash, Read, Glob, Grep
effort: high
---

# /security-check

Review changed files for security vulnerabilities before merging or deploying.

> **Note:** Claude Code's built-in `/security-review` command scans the current git diff for vulnerabilities. Use `/security-check` when you want a broader review: full file content, not just changed lines, run against the complete OWASP checklist below.

## Steps

1. Get the list of changed files: `git diff --name-only HEAD` (or vs base branch if on a feature branch)
2. Read each changed file fully
3. Analyse against the checklist below
4. Report findings grouped by severity

## Security Checklist

### Injection (OWASP A03)
- [ ] No raw SQL string concatenation — parameterised queries only
- [ ] No unsanitised user input passed to `eval`, `exec`, `spawn`, `system`, or template engines
- [ ] No path traversal: user input used in file paths must be validated/normalised

### Authentication & Authorisation (OWASP A01, A07)
- [ ] New endpoints have authentication middleware applied
- [ ] Authorisation checks are present (not just authentication)
- [ ] No hardcoded credentials, tokens, or API keys
- [ ] No secrets in environment variable names that get logged

### Cryptography (OWASP A02)
- [ ] No MD5 / SHA1 for security-sensitive hashing
- [ ] No custom crypto implementations
- [ ] TLS not disabled (`rejectUnauthorized: false`, `verify=False`, `InsecureSkipVerify`)

### Data Exposure (OWASP A02, A04)
- [ ] Sensitive fields (passwords, tokens, PII) are not returned in API responses or logged
- [ ] Error messages do not leak stack traces or internal paths to clients

### Dependency Risk (OWASP A06)
- [ ] New dependencies added — flag for review (name, version, purpose)

### Frontend (if applicable, OWASP A03)
- [ ] No `dangerouslySetInnerHTML` / `innerHTML` with unsanitised content
- [ ] No `javascript:` URLs
- [ ] CSP headers not weakened

## Report Format

```
## Security Review: <branch or files reviewed>

### Critical
> Fix before merging — potential for data breach or RCE.
<findings or "None">

### High
> Strong recommendation to fix before merging.
<findings or "None">

### Medium
> Should be addressed in a follow-up ticket.
<findings or "None">

### Info
> Notes and observations, no action required.
<findings or "None">
```

## Rules
- Every finding must include: file, line number, description, and a concrete fix recommendation
- Do not flag issues already caught by the project's static analysis / linter
- If no issues are found, state that explicitly — do not leave the section blank
