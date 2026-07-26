---
name: visual-verify
description: >-
  Prove a visual change by looking at the rendered surface — screenshot it and
  compare to the reference before saying done. Use after any UI, layout, theme,
  or color change, or when the user says it still looks wrong or doesn't match.
---

# Visual Verify

Never report a visual, layout, or theme change as done based on the diff or a
passing test. Look at the running surface.

## Steps

1. Run the actual surface (dev server, app, TUI/GUI, Storybook — whatever shows
   this UI). Don't start one the user already has running.
2. Capture what it looks like — screenshot it, or tell the user exactly how to
   see it.
3. Compare against the reference: the design (Figma/mock), the sibling surface it
   should match, or the before state. Name the specific things you checked
   (color values, spacing, border, active state, contrast).
4. If it doesn't match, keep the debug logging and iterate. Only say "done" once
   it visibly matches.

## Don't

- Claim a theme/color change works because the token math looks right — verify
  the rendered value.
- Delete instrumentation while the visual is still wrong.
- Trust unit tests as proof a UI renders correctly.
