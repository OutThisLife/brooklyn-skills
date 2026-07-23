---
name: ui-system
description: >-
  Reuse existing UI primitives, CSS vars, and DESIGN.md patterns — do not invent
  new buttons, colors, borders, shadows, or helpers. Use for Desktop/web/TUI UI
  work, redesigns, or when the user mentions shared primitives, tw4, or UI
  patterns.
---

# UI System

Reuse what the app already has. Don't invent a parallel UI kit.

## Do

1. Read `DESIGN.md` / area docs for the surface you're in.
2. Find the existing component/helper (button, input, dialog, progress,
   relative-time, dropdown, back row, …). Copy how Settings / Projects / etc.
   already do it.
3. Prefer a **variant** on an existing primitive over a new component.
4. Colors/spacing/type from **existing CSS vars / tokens** (including the
   app's Tailwind v4 setup). No one-off hex/shadow stacks.
5. Match the app's look: if the app doesn't use borders/shadows/sparkles,
   neither does your feature.

## Don't

- New button/input/modal implementations
- Local color palettes or decorative chrome
- Duplicate formatters (time, etc.) — use the shared ones
- New borders, backgrounds, shadows, sparkles, or badges the surrounding app
  doesn't already use — match the neighboring surface exactly
- Section chrome that nowhere else uses

If there's a design (Figma, mock, screenshot), match it — spacing, contrast, and
placement — before inventing anything. If you can't find the primitive, search
harder or ask — don't quietly make one.

While still iterating on look, also follow `ui-only` (no tsc/lint/commit yet).
