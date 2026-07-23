---
name: figma-implement
description: >-
  Implement a design from Figma faithfully using the app's own primitives. Use
  when building UI from a Figma file/frame, a mock, or a screenshot reference.
---

# Figma Implement

Build the design pixel-faithfully out of the app's existing primitives — not a
new UI kit.

## Steps

1. Pull the design context (Figma MCP if available, else the screenshot/mock).
2. Map it to existing primitives and tokens (`ui-system`): components, spacing,
   type, color vars. Reuse before inventing.
3. Build layout/structure first, then content.
4. Match spacing, padding, contrast, and states exactly — check the details (no
   white-on-white, no doubled padding, correct CTA contrast).
5. Optimize exported assets (e.g. SVGO for SVGs).
6. Iterate visually (`ui-only`) — no tsc/lint/commit until the user likes it,
   then confirm against the design (`visual-verify`).

## Don't

- Approximate spacing/colors when the design specifies them.
- Add chrome the design and app don't have.
