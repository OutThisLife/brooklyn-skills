# Precise technical figures

Start with a small semantic map: what entities are drawn, what each connection means, what the reader should learn, and what the diagram does not encode.

## Editable SVG

Use a viewBox and real text, not a screenshot of text. Carry the existing paper's font family and drawing conventions into the SVG. Namespace IDs for markers, patterns, titles and descriptions so several figures can be embedded on one page. Use a white backing rectangle for standalone SVGs when the destination might use dark mode.

At a 1000-unit figure width, useful starting values are 0.5–0.8-unit mesh lines, 1–1.5-unit relationships, 2-unit emphasis, 3–6-unit nodes and 16–22-unit text. These are ratios to tune at final size, not universal dimensions. A drawing that works at 1000 pixels may need fewer labels in a narrow print column.

Curved wireframe surfaces can supply the engraved visual language around a real schematic. Their shape must not imply an implemented algorithm or measured variable unless that mapping exists. Explicitly call decorative geometry schematic.

A caption should explain the meaningful boundary or exception rather than list every object in the drawing.

## Useful patterns

- **Temporal visibility:** show the cutoff and distinguish effective/event time from observation time where the system does. Missing earlier content stays missing; never show current content as a historical revision without evidence.
- **Relationships:** distinguish stored explicit edges from similarity leads. A model's neighborhood features may not include every edge shown by a reader. Explain multi-hop aggregation precisely, including whether paths can revisit nodes.
- **Execution:** separate preparation, review, authority and the actual write path. If writes require freshness checks, intent journaling and readback, show their order. A four-stage overview supplements rather than replaces an exact protocol.
- **Evaluation:** a schematic landscape is not a result curve. Use real data for quantitative plots and label illustrative diagrams accordingly. Preserve baseline, uncertainty and failure cases when the source includes them.

## Integration

Reuse the destination's figure, caption, font and print styles. Add nearby prose only if it helps interpret the drawing. Keep numbering and links coherent. Embed SVG when a one-page publication does not copy external assets; keep a standalone editable SVG as the source.

Inspect browser rendering and PDF page breaks. Check that captions remain beside their figures, IDs are unique, and text is not clipped by the viewBox. Do not claim the PDF is correct from the HTML screenshot alone.
