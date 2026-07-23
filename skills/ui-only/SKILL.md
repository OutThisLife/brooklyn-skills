---
name: ui-only
description: >-
  While iterating on UI, do not waste time on tsc, lint, typecheck, format,
  full test suites, commit, or push until the user likes how it looks and
  works. Use for any UI/UX work, layout, redesign, Figma implementation, visual
  polish, "make it look right", or when they want to see the UI before cleanup.
---

# UI Only

When you're changing how something looks or interacts: get the UI right first.
Don't burn turns on tsc, lint, or commit until they say it's good.

## Don't run yet

Until they like the UI (or explicitly say to clean/commit):

- `tsc` / typecheck / `npm run build` as a finish step
- eslint / prettier / biome
- full test suites just to greenlight a commit
- `git commit` / `git push` / opening the PR as done

Dev server, screenshots, and targeted runs needed to see or use the UI are fine.
Don't start a dev server the user already has running — assume it's up unless
told otherwise. Keep debug logging in place while something's still broken;
remove it only once it works.

## Do this instead

1. Change the UI.
2. Show it (or tell them how to look).
3. Take feedback and iterate.
4. When they say it's good / lgtm / clean it / commit it, then run checks,
   use `clean`, commit, and do whatever else the repo needs.

If you're not sure whether to keep iterating, ask.

## Scope

Any UI surface (web, desktop, TUI). Skip for backend-only work.
For primitives and tokens, also use `ui-system`.
