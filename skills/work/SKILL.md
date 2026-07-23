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

## Then

- Do the task in the worktree; never in the primary checkout, and never in
  another agent's worktree.
- UI → `ui-only` + `ui-system`. Tests → whatever the repo uses.
- When handing off, tell the user the worktree path and how to run it.
- Ship → commit, push the branch, open a PR/MR to the default branch.
- Cleaning up → offer to remove worktrees whose branch is already merged.
- Reviewing an existing PR instead of new work → `pr-triage`.
