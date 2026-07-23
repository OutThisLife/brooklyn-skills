# Always-on defaults

Behaviors that should apply to **every** session, not wait for a skill to be
invoked. The named skills under `skills/` handle deeper workflows; this file is
the baseline that stops you from re-teaching the same things every session.

## Wire it up (always-on)

- **Cursor:** copy into `~/.cursor/rules/defaults.mdc` (user-level) or
  `.cursor/rules/defaults.mdc` (per repo), with frontmatter `alwaysApply: true`.
- **Claude Code / Codex / most agents:** paste into your `AGENTS.md` (user-level
  or repo root).

## The defaults

### UI / visual work
- Changing how something looks or behaves? Iterate on the UI first. Don't run
  tsc / lint / typecheck / build / format, full test suites, commit, push, or
  open a PR until the user says they like it. (→ `ui-only`)
- Reuse the app's existing primitives, components, and design tokens. Never build
  a parallel UI kit, and don't add borders, backgrounds, shadows, sparkles,
  badges, or section chrome the surrounding app doesn't already use. (→ `ui-system`)
- Don't start a dev server the user is already running — assume it's up.
- Keep debug logging in place while something is still broken; remove it only
  once it works.
- Don't claim a visual/theme change is done without running the surface and
  checking it against the reference.

### Isolation & worktrees
- Do real feature/fix/redesign work in a dedicated git worktree, not the primary
  checkout. Mirror the repo's existing branch/worktree conventions. (→ `work`)
- Never edit another agent's worktree. Leave the user's primary checkout on its
  default branch, and return the worktree path plus how to run it.

### Shipping
- Before any PR handoff (create, update, automerge, "next PR"), do a cleanup
  pass: KISS/DRY, match local style, cut dead code and debug logging. "Clean"
  means polish — it does **not** mean run the test suite. (→ `clean`)
- A PR description says what the change is as a whole (a short intro), not a
  changelog of your steps.
- Split a PR into topical commits by default; don't dump everything into one
  commit unless asked. (→ `pr-update`)
- CI green is part of "done." Don't report a task complete while checks are red;
  if a failure is a known upstream flake, say so with the run link. (→ `pr-green`)
- **ALWAYS link PR/MR numbers.** In chat, comments, summaries, and tweets: never
  bare `#123`, `PR 123`, or `MR !123`. Use a markdown link with the full forge
  URL, e.g. `[#123](https://github.com/org/repo/pull/123)` /
  `[!123](https://gitlab.com/…/merge_requests/123)`.
- **ALWAYS end a finished set of work with the PR/MR link.** If the branch has
  (or just got) a PR/MR, the wrap-up must include that URL. No "done" without it.
  (→ `pr-update`)

### Reviews
- Addressing review comments (bots or humans): fix or reply, then verify the
  threads are actually resolved via the forge API before claiming done — don't
  leave them hanging. (→ `pr-bot-reviews`)

### Scope discipline
- "Audit" / "don't touch code" / a plain question means investigate and answer
  first; write no code until told to go.
- Don't act on assumed scope. Report only the work actually requested and done,
  not work you imagined.
- When runtime or an environment is broken, check logs/observability first, then
  code.
