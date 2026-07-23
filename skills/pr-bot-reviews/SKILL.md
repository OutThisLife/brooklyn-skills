---
name: pr-bot-reviews
description: >-
  Fix, reply to, and resolve PR/MR review comments (especially bots like
  Copilot), then push and repeat until threads are clear. Use when the user
  says address reviews, address Copilot, or review-loop.
---

# PR Bot Reviews

Clear open review comments on a PR/MR. Mainly for bots (Copilot, etc.); same
loop for humans. Use `gh` or `glab`.

## Loop

1. Commit/push if there's unpushed work (ask if the message is unclear).
2. List open/unresolved inline comments + review bodies.
3. If they want a bot loop, request the repo's review bot.
4. Wait for that pass (don't spin forever — if stuck ~10–15m, say so).
5. For each comment: fix if valid; short reply if declining; mark resolved.
6. Commit/push (`pr-update` if they want splits).
7. Repeat until unresolved threads are gone (or only deferred stuff they OK'd).

## Judgment

- Valid → fix + resolve.
- Wrong / outdated → short reply + resolve (or leave open if they should decide).
- Nit out of scope → ask once.
- Never resolve a #1 maintainer comment without fixing it or an explicit override
  (`pr-triage`).

## Useful commands

```bash
gh api repos/{owner}/{repo}/pulls/<N>/comments --jq '.[] | {user:.user.login,path,line,body:(.body[:200])}'
gh api repos/{owner}/{repo}/pulls/<N>/reviews --jq '.[] | {user:.user.login,state,body:(.body[:200])}'
gh api repos/{owner}/{repo}/pulls/<N>/comments -f body='…' -F in_reply_to=<comment_id>
gh pr edit <N> --add-reviewer copilot   # if that's what the repo uses
```

GitLab: `glab mr note` + discussions API.

## Done when

Re-query the forge API for open/unresolved threads and confirm none remain
(except ones the user explicitly deferred) — don't trust that a reply resolved
them, verify. Fail closed: if any thread is still open, you're not done. Latest
push is up; give a short summary of fixed vs replied-through; end with the
PR/MR as a markdown link (`[#N](full-url)`). Never bare `#N`.
