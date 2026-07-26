---
name: clean
description: >-
  Polish your own diff by hand with KISS/DRY and local style — the pre-handoff
  pass, not a test run and not a subagent sweep. Use for /clean, "clean it up",
  "tidy this", and automatically before creating, updating, or automerging a PR
  or moving to the next one.
---

# Clean

KISS/DRY and copy the local code style. Be elitist, shorthand, clever, concise,
efficient, and elegant.

**"Clean" means polishing the code — it does NOT mean running the test suite,
tsc, or lint as the task.** Run a check only if it's genuinely needed to confirm
the polish is safe.

Clean is a standalone pass, not just a pre-PR step — run it whenever things get
messy, including mid-work. Also run it automatically before any PR handoff
(creating, updating, automerging, or moving to the next PR) without being told
each time.

## Do

1. Re-read your diff. Cut dead code, leftover debug logging, and duplication.
2. Extend existing helpers — don't parallel-implement.
3. Match neighboring style (names, imports, file layout, comment density).
4. Prefer the small sharp version over ceremony.
5. UI work: only after they like the UI (`ui-only`). Use `ui-system` for
   primitives.
6. On the PR: title/body describe the change as a whole (a short intro), not a
   changelog of steps. Split into topical commits (`pr-update`), run
   `no-tropes` on the text, and link the PR.

## Don't

- Run the test suite / tsc / lint just because you were told to "clean"
- Unrelated refactors
- New abstractions with one caller
- Scope creep dressed up as cleanup
