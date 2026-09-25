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
4. Treat the duplicate as a fresh review target. Request the original developer
   reviewer/team and use the repo's pending human/code-review labels. Do not
   copy QA approval or claim a developer checkmark from the sibling; the
   release PR needs its own explicit developer approval. Verify assignees,
   review requests, and labels after updating them.

## Estimate an integration before changing branches

- Fetch the real upstream default branch and every dependency head; compare ancestry so already-included fixes are not imported twice.
- Use `git merge-tree --write-tree --name-only <base> <head>` to estimate conflicts without modifying a checkout or index. Report conflict counts as textual integration scope, not proof that auto-merged code is correct.
- Preserve current upstream security and profile-routing behavior when reconciling older UI work; do not resolve whole files with ours/theirs just to eliminate markers.
- Distinguish updating the local clone from publishing a fork-default update. A PR in a separate repository still compares against that repository's base; local upstream freshness does not update it.

## MR additive-repair safeguards

- Invoke the pinned Node executable directly for worktree tests and set `NODE_PATH` to that worktree's `mr_modules` on the command. Shared dependency symlinks and concurrent shells can otherwise resolve another checkout; verify `process.execPath` and `require.resolve('MRUtils')` first.
- Check the merge commit's effective diff against its own base, not only HEAD. Lint-staged sees upstream files staged by a merge and can rewrite unrelated code; run targeted lint/tests and use a per-invocation hook override for the additive merge commit rather than changing repository hook configuration.
- Reconcile CMS migration composition with already-merged migrations in both execution orders. Preserve foreign-edit/staged-batch refusal and verify published records before retiring an old route; saved redirect flags alone do not establish that a redirect reached production.

## Don't

- Collapse a stack by merging the default branch into the child.
- Let the two base PRs drift apart.
- Finish without listing every PR/MR in the stack as a link.
