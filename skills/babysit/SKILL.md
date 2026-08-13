---
name: babysit
description: >-
  Watch an open PR/MR until it's green or merged — poll checks, kick stalled
  CI, rerun flakes, catch late review threads. Use for /babysit, "babysit it
  to green", "watch it", "keep an eye on CI", or any stay-on-it ask after a
  PR handoff.
---

# Babysit

Stay on the PR after handoff until it's actually done. Being asked to babysit
IS the ask to poll — but report state changes only, no heartbeats, no
per-poll narration.

## Loop

1. Snapshot: `gh pr view <N> --json
   state,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup,autoMergeRequest`
   plus `gh pr checks <N>`.
2. Poll inside bounded shell loops (a single `for` with `sleep 30`–`60`
   between iterations), not one message per check.
3. React by cause:
   - **CI never started** → kick it:
     `git commit --allow-empty -m "chore: kick CI" && git push`.
   - **Red caused by this branch** → fix it (the `pr-ready` loop), push,
     resume watching on the new SHA.
   - **Flake / infra red** → rerun the failed jobs; repeat until green. Note
     the flake in one line with the run link.
   - **New review threads** → handle per `pr-ready` (fix or reply, verify
     resolved via the forge API), resume.
4. Repeat until done. A push or rerun is progress, not an exit.

## Merging

Arm automerge only when the ask says so — "set to automerge", "make CI
green", or any mention of merging. A plain "babysit" / "watch it" ends at
green with threads resolved: report, don't merge.

## CI quirks

- `gh run rerun` refusing with "already running" → cancel the run first,
  then rerun.
- A cancelled run showing "no checks reported" is pending, not red — wait
  for it to re-report before calling it either way.
- Rollup gates ("All required checks pass") go red because a leaf did —
  diagnose the leaf failure, never the gate.

## Done when

Re-query the forge — don't trust that a push went green or a rerun stuck.
Merged, or every check green with no unresolved threads. Fail closed: any
red or open thread means keep watching. Wrap up with the PR/MR link and what
the watch consumed — reruns used, kicks, fixes pushed.

## Scope

- **In:** watching an open PR, kicking stalled CI, rerunning flakes, small
  branch-caused fixes, late review threads.
- **Out:** opening or refreshing the PR (`pr-update`, `cpr`), full
  rebase/red-CI overhauls (`pr-ready`), other people's PRs (`pr-triage`),
  merging unasked.
