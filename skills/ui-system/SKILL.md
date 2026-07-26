---
name: ui-system
description: >-
  Reuse existing UI primitives, CSS vars, and DESIGN.md patterns instead of
  inventing new buttons, colors, borders, shadows, or helpers — including when
  implementing a Figma file, mock, or screenshot. Use for Desktop/web/TUI UI
  work, redesigns, or when the user mentions shared primitives, tw4, Figma, or
  UI patterns.
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

## Working from a design

Figma file, mock, or screenshot: match it — spacing, contrast, placement —
before inventing anything.

1. Pull the design context (Figma MCP if available, else the screenshot/mock).
2. Map it to existing primitives and tokens before building anything new.
3. Layout and structure first, then content.
4. Match spacing, padding, contrast, and states exactly. Check the details —
   no white-on-white, no doubled padding, correct CTA contrast.
5. Optimize exported assets (SVGO for SVGs).
6. Don't approximate spacing or colors the design specifies, and don't add
   chrome neither the design nor the app has.

If you can't find the primitive, search harder or ask — don't quietly make one.

While still iterating on look, follow `ui-only` (no tsc/lint/commit yet). Once
they like it, confirm against the design with `visual-verify`.
