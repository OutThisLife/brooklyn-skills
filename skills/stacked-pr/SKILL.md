---
name: stacked-pr
description: >-
  Handle dependent/stacked PRs and same-code-on-multiple-bases correctly. Use
  for a PR stacked on another, or when the same change must land on the default
  branch plus a release/production branch.
---

# Stacked & Multi-base PRs

## Stacked (dependent) PRs

A child PR builds on a parent PR's branch. Update the stack bottom-up:

1. Update the parent branch/PR first.
2. Rebase the child onto the updated parent — not onto the default branch, and
   never "merge main into the leaf" as the only step.
3. Push each level; keep each PR's base pointing at the one below it.

## Multi-base (release + default)

Some orgs require the same change on the default branch AND a release/production
branch:

1. Confirm the required target branches from the repo's rules.
2. Land the change once, then cherry-pick/port the identical code to the other
   base as a second PR.
3. Keep the two PRs' code identical; note the sibling in each description.

## Don't

- Collapse a stack by merging the default branch into the child.
- Let the two base PRs drift apart.
- Refer to any PR/MR in the stack by bare number — always
  `[#N](full-url)` / GitLab equivalent, and list every PR URL when done.
