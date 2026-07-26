---
name: pr-ready
description: >-
  Clear everything blocking an existing PR/MR from merging — rebase onto the
  default branch, get CI green, and resolve review threads (Copilot and human).
  Use for "rebase on main", "make CI green", "fix CI/CD", "address the reviews",
  "address Copilot", "review-loop", or "get this mergeable".
---

# PR Ready

An open PR/MR isn't mergeable. Two things block it — a **stale base or red CI**,
and **open review threads**. Same loop for both: fix, push, re-query the forge,
repeat. Handle whichever is blocking; usually that's both.

No feature work. No drive-bys.

## Rebase + CI

1. Find the worktree for this PR (or create one per repo convention). Prefer an
   existing worktree the user already has.
2. `git fetch origin <default>` (usually `main`).
3. Rebase onto `origin/<default>`. Fix conflicts only as needed to preserve intent.
4. Push (`--force-with-lease` if the rebase rewrote history).
5. Watch CI. Fix **failures caused by the rebase or existing breakage on this
   branch** — nothing else.
6. Flaky upstream on the default branch → say so. Don't paper over it with
   unrelated test deletes.

## Review threads

1. Commit/push any unpushed work first (ask if the message is unclear).
2. List open/unresolved inline comments + review bodies.
3. Want a bot pass? Request the repo's review bot, then wait for it — don't spin
   forever; if it's stuck ~10–15m, say so.
4. Per comment: valid → fix and resolve. Wrong or outdated → short reply and
   resolve. Nit out of scope → ask once. Never resolve a #1 maintainer comment
   without fixing it or an explicit override (`pr-triage`).
5. Push (`pr-update` if they want the commits split).
6. Repeat until unresolved threads are gone, or only ones they OK'd deferring.

## Done when

Re-query the forge — don't trust that a push turned CI green or that a reply
resolved a thread. **Fail closed:** any red check or open thread means you're
not done.

Report the branch tip, checks status, and a short fixed-vs-replied summary.

## Scope lock

- No refactors, restyles, or "while I'm here" fixes.
- Don't expand the PR description or supersede unless asked (`pr-update`).
- Wrong-premise PR that needs salvage → stop and say so, hand off to
  `pr-triage`. Don't silently rewrite it.

## Forge cheatsheet

```bash
# GitHub — CI
gh pr view <N> --json url,headRefName,baseRefName,statusCheckRollup
gh pr checks <N>

# GitHub — threads
gh api repos/{owner}/{repo}/pulls/<N>/comments --jq '.[] | {user:.user.login,path,line,body:(.body[:200])}'
gh api repos/{owner}/{repo}/pulls/<N>/reviews  --jq '.[] | {user:.user.login,state,body:(.body[:200])}'
gh api repos/{owner}/{repo}/pulls/<N>/comments -f body='…' -F in_reply_to=<comment_id>
gh pr edit <N> --add-reviewer copilot   # if that's what the repo uses

# GitLab
glab mr view <N>
glab ci status
glab mr note <N>        # + the discussions API for resolve
```
