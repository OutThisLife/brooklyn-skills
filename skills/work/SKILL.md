---
name: work
description: >-
  Kick off a task in a fresh isolated git worktree instead of the current
  checkout. Use when the user invokes /work (optionally with a slug or
  description) to start something new without touching their working tree.
---

# /work

`/work [slug]` is a declaration for this task: "spin up a dedicated worktree and
do the work there." It applies to what the user is starting right now — it is
not a standing rule that all work always happens in worktrees.

When invoked:

1. Look at what the repo already does, and copy it.
2. Create the worktree + branch and `cd` into it.
3. Do the requested work there.

## Work aimed at an issue ("if it's open and reproducible")

Do these in order before writing any fix:

0. **Load the repo's own gate skill first.** If the repo has a deployment or
   brain skill (a `<prefix>-repo` skill, a triage/claim system), load it
   before searching. Its per-issue gates (claim, overlap check, side-effect
   screen, risk title, auto-merge classifier) apply to a single `/work` fix as
   much as to a sweep. Skipping them because the request said "/work" rather
   than "triage" is the failure: the PR ships without the risk and side-effect
   sections she expects, and can duplicate her own open PR.
1. **Find the issue.** Search open and closed issues with several phrasings
   (`gh issue list --state all --search "<q>"`), plus `in:title` variants. A
   closed issue with a close-by-PR may already cover it. Check that before you
   call a newer report a duplicate.
2. **Look for a PR that already fixes it.** Search with
   `gh pr list --state all --search "<issue#>"` and with keywords. Drafts count:
   a contributor can park a finished fix as a draft because of an open-PR cap.
   If a complete fix exists, salvage it (cherry-pick the commit so authorship
   is kept) instead of writing a parallel one. Check **her own** open PRs too
   (`gh pr list --author @me --state open --json number,title,files,mergeable,autoMergeRequest`),
   not only contributors': an armed-but-CONFLICTING PR of hers on the same
   function is live work. Fold both into ONE combined PR that supersedes them
   (cherry-pick what applies, port the rest by hand onto main's current file
   layout, keep every `Co-authored-by`), then disarm (`gh pr merge N --disable-auto`)
   and close the sources with a comment linking the replacement.
3. **Prove it red on the base.** Apply only the tests first
   (`gh pr diff <N> > f.diff && git apply --include='tests/*' f.diff`), run
   them, and see them fail. Then remove the file and `git cherry-pick` the real
   commit, so the test file isn't left as an untracked conflict.
4. **Reproduce the user-visible path end to end.** Run it on a detached base
   worktree and on the branch, and keep both outputs as before/after evidence
   for the PR body.
5. **Re-run any failures on the base worktree** before calling them unrelated.
   "Fails identically on untouched base" is the claim to report.

Answer the "is it open / can it be repro'd" part first in the handoff, then
the fix and the PR link.

## Read the repo's conventions

```bash
git worktree list                                   # sibling dirs + branches
git branch -a --sort=-committerdate | head -20      # branch prefix/slug pattern
git remote show origin | sed -n 's/.*HEAD branch: //p'   # default branch
```

- **Branch prefix** — mirror the dominant one (e.g. `<initials>/<slug>`). None
  obvious → ask.
- **Worktree dir** — mirror sibling naming/location (commonly `<repo>-<short>`
  next to the primary checkout). Short suffix ≠ full branch is fine.
- **Base** — current default branch unless they name another.
- **Slug** — from the `/work` argument, else the task description.

## Create it

```bash
repo="$(git rev-parse --show-toplevel)"
parent="$(dirname "$repo")"
default="$(git -C "$repo" remote show origin | sed -n 's/.*HEAD branch: //p')"
git -C "$repo" fetch origin "$default"
git -C "$repo" worktree add -b <prefix>/<slug> "$parent/$(basename "$repo")-<short>" "origin/$default"
cd "$parent/$(basename "$repo")-<short>"
```

Reuse a matching worktree/branch if one already exists — don't duplicate. Match
how siblings handle `node_modules` / `.venv` / symlinks.

- Never `git stash` in a worktree while other agents run: the stash list is shared repo-wide, so a pop can grab another worker's WIP. Commit WIP instead.

## Then

- Do the task in the worktree; never in the primary checkout, and never in
  another agent's worktree.
- Never `git stash` in a worktree: `refs/stash` is shared by every worktree of
  the repo, so a parallel agent can pop your entry (or you pop theirs). To test
  against base, copy the file aside (`git show HEAD:<path> > …`) or use a
  throwaway worktree instead.
- Every worker and subagent gets its own worktree, and the worktree path is in
  its instructions. Fixes use a `bb/*` branch. Verification, typecheck, and
  tests use a detached worktree at `origin/<default>`. When its lockfile matches
  the primary's, symlink every `node_modules` (root and workspace packages) to
  the primary's; install only on a lock change, after removing those links.
  Never edit, install, build, typecheck, or test in the primary checkout.
- Prefer direct execution for focused fixes. Do not delegate routine sibling-path
  audits or cleanup; reserve subagents for substantial independent work that
  clearly saves time.
- Default to pnpm for JavaScript package commands and install examples when the repository supports it. Respect an existing different package-manager/lockfile contract rather than introducing a second lockfile.
- UI → `ui-only` + `ui-system`. Tests → whatever the repo uses.
- When handing off, tell the user the worktree path and how to run it.
- Ship → commit, push the branch, open a PR/MR to the default branch.
- Cleaning up → offer to remove worktrees whose branch is already merged.
- Reviewing an existing PR instead of new work → `pr-triage`.
