---
name: pr-green
description: >-
  Rebase a PR/MR onto the default branch and make CI green with minimal scope.
  Use when the user says "rebase on main", "make sure CI is green", "fix CI/CD",
  or "up to date and ci good" for an existing PR.
---

# PR Green (rebase + CI only)

Get an existing PR/MR **rebased and green**. No feature work. No drive-bys.

## Steps

1. Find the worktree for this PR (or create one per repo convention). Prefer an
   existing worktree the user already has.
2. `git fetch origin <default>` (usually `main`).
3. Rebase onto `origin/<default>`. Fix conflicts only as needed to preserve intent.
4. Push (`--force-with-lease` if rebase rewrote).
5. Watch CI via `gh pr checks` / `glab ci status`. Fix **failures caused by the
   rebase or existing breakage on this branch** — nothing else.
6. Report: branch tip, checks status, and the PR/MR as a markdown link
   (`[#N](full-url)`). Always link the number; always include the URL.

## Scope lock

- Do **not** refactor, restyle, or "while I'm here" fixes.
- Do **not** expand the PR description or supersede unless asked.
- If a failure is flaky upstream on `main`, say so — don't paper over it with
  unrelated test deletes.
- If the PR is wrong-premise / needs salvage, stop and say so (hand off to
  `pr-triage`) instead of silently rewriting.

## Forge cheatsheet

```bash
# GitHub
gh pr view <N> --json url,headRefName,baseRefName,statusCheckRollup
gh pr checks <N>

# GitLab
glab mr view <N>
glab ci status
```
