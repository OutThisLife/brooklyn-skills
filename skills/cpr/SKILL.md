---
name: cpr
description: >-
  Clean the diff, then open or refresh the PR/MR — one pass, ending in the
  linked URL. Use for /cpr, "clean and PR", "tidy it up and push the PR", or
  any handoff where polish and the PR should happen together.
---

# CPR (clean → PR)

`clean` then `pr-update`, in that order, without asking between them. Use it
when the work is done and the branch should end up as a PR someone can read.

Run the two skills for real — this file is the sequence, not a replacement for
their contents.

## Steps

1. **Clean** (`clean`). Re-read the diff, cut dead code and debug logging,
   extend existing helpers instead of paralleling them, match neighboring
   style. Polish only — this is not a test/tsc/lint run.
2. **Shape + publish** (`pr-update`). Topical commits, title and body that
   describe the change as a whole, media in an existing body preserved
   verbatim, prose through `no-tropes`.
3. End with the PR/MR as a markdown link — number **and** full forge URL.

## Order matters

Clean first, always. Committing then cleaning means the commit split describes
code you already threw away, and the PR body describes a diff that no longer
exists.

## Stop conditions

- UI work: don't start until the user likes the UI (`ui-only`).
- Nothing to clean is a valid outcome — say so in one line and go to step 2.
- Don't stall on a clean pass. If polish keeps expanding, that's scope creep;
  ship the narrow version.

## Scope

- **In:** polish the diff, shape commits, create or update the PR/MR, print the
  link.
- **Out:** CI and review threads (`pr-ready`), triage/salvage (`pr-triage`),
  stacked bases (`stacked-pr`), merging.
