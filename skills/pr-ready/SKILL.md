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
3. Honor repository history rules before choosing an update strategy. Where force pushes are forbidden or the user requires a merge, merge `origin/<default>` into the existing branch without rewriting commits. Otherwise rebase onto `origin/<default>`. Resolve conflicts by reading both sides' intent and regression tests; shared callback code must preserve newer callback-once behavior as well as the PR's guards.
4. Push (`--force-with-lease` if the rebase rewrote history).
5. Watch CI. Fix **failures caused by the rebase or existing breakage on this
   branch** — nothing else.
6. Flaky upstream on the default branch → say so. Don't paper over it with
   unrelated test deletes.
7. Verify `process.execPath` in the same execution mode as MR tests, using the repository's package manager. Background login shells can replace an earlier PATH export, so select the project's declared Node version inside the launched command. A newer runtime can shadow happy-dom localStorage or remove util.isDate; rerun unchanged failing tests under the supported runtime before editing application code.
8. For merge commits, old lint-staged hooks can autoformat every upstream file in the index. Run lint on the PR delta and the repository precommit checks explicitly, preserve upstream files, and document any one-command hook bypass used solely to prevent unrelated formatting. Never call that bypass a substitute for verification. Do not assume `HUSKY_SKIP_HOOKS=1` is honored: inspect the hook output. Legacy hook `git add` can also include unstaged edits to already-staged files. Reconcile the resulting commit against the pre-merge PR file set plus intended fixes, and restore unrelated suppression-file pruning rather than publishing incidental changes.

- Unset `npm_config_prefix` on MR commit processes as well as test processes so Husky’s nvm hook can select Node 18. If legacy lint-staged concurrently runs `git add` for JS and Vue groups and races on index.lock, first verify the lock has disappeared and review the staged diff. Split the staged extension groups into additive commits if needed; do not delete a live lock, rewrite published history, or bypass the hooks to hide the race.

## CI-only failures

- Distinguish a V8 heap-limit abort from a container OOM before changing CI resources. Measure the failing typecheck with the supported runtime and extended diagnostics, then verify a bounded heap override scoped to that job; keep the typecheck enabled.
- Reproduce repository-wide duplicate scans against a tracked `git archive` snapshot, not a working tree full of local build output. Attribute clones before changing configuration. Machine-generated API artifacts should be regenerated and drift-checked, not manually deduplicated; preserve the authored-code threshold when excluding those artifacts.
- Verify the package script's actual scope before calling a run the full backend suite. A package's `test` script may run unit tests only, while `exec jest --runInBand` exercises every configured Jest project. Require the completed project/suite summary, not a partial log.

## Interrupted repairs

- Reconcile the current remote head, worktree diff, and saved test evidence before resuming an interrupted repair. Preserve an existing merge and relevant uncommitted fixes; do not repeat a repair already pushed by another worker. A partial test log without a completed runner summary is not a pass.
- When a merge exposes tests for deliberately deleted files, verify the deletion commit and remaining production references before retiring those assertions. Keep active replacement coverage and record the before/after failure evidence; do not restore retired application code or delete unrelated tests merely to turn CI green.

## Review threads

1. Commit/push any unpushed work first (ask if the message is unclear).
2. List open/unresolved inline comments + review bodies.
3. Want a bot pass? Request the repo's review bot, then wait for it — don't spin
   forever; if it's stuck ~10–15m, say so. A Claude comment explaining how to request a manual review is not a completed review. When actual AI review is requested, trigger it for each PR/base and verify the submitted review matches that PR's current head. Inspect the check's title/body: a neutral clean review with an explicit no-issues result differs from a neutral worker result with zero turns and no review. Keep those outcomes separate.
   A managed Claude review and the legacy Claude GitHub Action can both react to one mention. If the legacy action fails but the managed review completes, reply with both exact run/review links; do not call the failed action successful or blindly rerun both services.
4. Per comment: valid → fix and resolve. Wrong or outdated → short reply and
   resolve. Nit out of scope → ask once. Never resolve a #1 maintainer comment
   without fixing it or an explicit override (`pr-triage`).
5. Push (`pr-update` if they want the commits split).
6. Repeat until unresolved threads are gone, or only ones they OK'd deferring.

## Large visual assets in a review

- Measure lossless conversion with the existing image tooling before promising a size reduction. Compare decoded RGBA bytes and dimensions, preserve color metadata, and inspect the rendered article on desktop/mobile. Keep source provenance URLs unchanged and map only the optimized local targets; test every corpus image against both local and immutable-release asset bases rather than widening CSP to hide missing vendoring.
- Distinguish final-tree/browser savings from Git-history savings. An additive optimization leaves old blobs in ancestry; recommend a separately authorized squash merge when appropriate, never claim the history was reduced or delete preserved prototype branches.
- Persist the paginated review inventory and per-thread reply/fix evidence to a local JSON ledger. Large `gh` output can be truncated through tool wrappers; redirect API JSON to disk before parsing, and verify unresolved counts against every page before handoff.

## Done when

Re-query the forge — don't trust that a push turned CI green or that a reply
resolved a thread. **Fail closed:** any red check or open thread means you're
not done.

- Confirm the PR API head matches the pushed SHA before attributing checks to it. Git refs can update before the PR API catches up; read the remote ref and retry the PR query rather than treating the preceding head's checks as current.
- Inventory inline threads again after local verification, not only before it. Bot reviews may arrive while tests run; persist every page, reply with the fixing commit, then read back resolution and the exact reply.
- Validate every explicit test path before a focused Vitest run, and compare its final file count with the requested set. Vitest can return exit 0 after running only the matching subset when one supplied path is wrong; a green exit alone does not prove all requested files ran.
- Distinguish an advisory workflow's green wrapper from its underlying lint findings. Verify a focused additive fix against its immediate parent when the whole PR has known advisory debt, and report both scopes without widening into unrelated cleanup.

Report the branch tip, checks status, and a short fixed-vs-replied summary.

## Urgent preview handoff

- Freeze audit scope when the user prioritizes publication. Publish completed, authorized work before more exploratory checks; address only actual build/CI blockers afterward.
- Trace the exact requested route to its unpublished dependencies before pushing. A successful deployment without the new article/feed code does not satisfy a requested URL. Verify that exact deployed URL returns the intended content, not merely HTTP 200 or a ready build.
- Reconcile shared-worktree ownership explicitly. Preserve another worker's changes until authorized; once the user authorizes publishing the remaining work, include its required server modules, dependencies, asset policy and environment declarations together. Never include actual credential files.
- On delegation failure, reconcile partial edits immediately, especially red tests without their implementation. Report published, locally complete and unfinished work separately; test counts are not shipment status.

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
