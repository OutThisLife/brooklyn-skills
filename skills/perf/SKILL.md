---
name: perf
description: >-
  Investigate and fix a performance problem with the profile-driven loop:
  baseline, profile, find the hot path, fix, re-measure. Use for /perf, slow
  code, or optimization work.
---

# Perf

The general performance loop. Profiling (CPU profile, flamegraph, memory
snapshot, trace) is the usual tool, but the loop is the same regardless of which
one fits.

## Loop

1. Reproduce the slow path and capture a baseline number — time, memory, FPS,
   request latency, whatever matters here.
2. Profile to find the real hot path: CPU profile / flamegraph / memory snapshot
   / trace as fits. Reuse the repo's existing profiler; don't build a parallel
   harness.
3. Read the profile, not your intuition — fix the actual hot path.
4. Re-measure. Record before/after in the PR title/description.
5. Ship in topical commits (`pr-update`), `clean`, keep CI green.

## Don't

- Optimize by guess before profiling.
- Fiddle with the measurement system instead of improving perf.
- Run a full suite or profile that overwhelms the machine — scope the run.
- Report gains you didn't measure.
