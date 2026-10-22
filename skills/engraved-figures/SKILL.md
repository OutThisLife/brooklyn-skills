---
name: engraved-figures
description: Create scientific figures, technical plates, research posters and diagram collections in a monochrome engraved-paper style. Use for old-school wireframes, stippled plots, dense academic layouts, or understated redacted-document graphics. Supports precise SVG documentation and illustrative raster art.
---

# Engraved figures

Scientific drawing carries the composition: fine wireframes, stippled points, clear axes, serif labels, and generous space inside a dense page. Before choosing a layout, open [the reference showcase](references/examples/showcase.html): **one landscape plate** ([reference-plate.png](references/examples/reference-plate.png)) and a **net-metric chart** ([reference-chart.png](references/examples/reference-chart.png)). Cyclic or redacted posters follow [poster direction](references/poster-direction.md) without a bundled poster file. Read [multi-figure plates](references/example-set.md) and [chart direction](references/chart-direction.md). Match bundled density and grammar; use the user's subject and real data when claiming measured results.

## Choose the right kind of figure

- **Technical documentation:** derive the relationships from source material or implementation. Prefer editable SVG with real text and an accessible title/description. Describe exactly what the marks, lines, boundaries and axes mean. Keep the mechanism legible. Read [technical figures](references/technical-figures.md).
- **Quantitative charts on paper:** thin smoothed daily lines, one combined moving average, shaded windows and dashed event markers — not dashboard widgets. Read [chart direction](references/chart-direction.md).
- **Illustrative poster or standalone art:** use the available image-generation workflow when a raster illustration is requested. Scientific geometry can serve as a metaphor, clearly labeled schematic. A torus does not establish a storage topology; a landscape is not measured performance. Read [poster and redaction direction](references/poster-direction.md).
- **Interactive or animated composition:** use actual geometry in the requested renderer. Preserve the approved page, typography and camera composition. Agree the meaningful behavior from the request: rotating a form, scrubbing a time slice, following a path, selecting a neighborhood. Keep text stationary and readable. Add motion controls and respect reduced motion. Animation and export workflows remain separate from this visual style.

Honor the user's requested medium. Do not turn a request for an image into a website, a paper into an animation, or a diagram into a new product interface.

## Visual grammar

- Black and neutral gray ink on clean white or gently warm paper. Monochrome is the default; color needs a reason or a user request.
- Fine curved mesh lines and stippling form the drawings. Use heavier lines for selected paths or meaningful boundaries. Nodes remain small; avoid glossy spheres and dramatic shading.
- Serif typography throughout the paper. STIX Two Text is appropriate for technical publishing; Times is a useful fallback. Use italic annotations and restrained small caps. Monospace belongs to actual identifiers, not all labels.
- Hairline rules organize the page. Avoid rounded cards, icons, UI panels, badges, gradients, shadows and decorative controls.
- Several substantial figures beat one central generic network surrounded by tiny icons. Match the reference's number, scale and distribution of figures when a reference is supplied. A full poster might use five main figures and several lower-column diagrams; a single figure should stay a single figure.
- Keep labels outside dense geometry. Use short leaders when needed. At final display or print size, the labels must remain readable.
- Preserve clean paper. Simulated aging, stains, copier dirt, stamps, invented document codes and agency seals require explicit requests. “Redacted files” usually means opaque rectangles on an ordinary document, not a spy-movie prop.

## Adapt the form to the explanation

Point clouds can illustrate many observations. Wireframe slices can show successive views. Neighborhood graphs explain relationships. A narrowing field can illustrate bounded selection. Gate planes can separate stages. Choose based on the claim, not a fixed visual inventory.

For explanatory work, distinguish illustrative form from data encoding. A time cutoff needs an actual timeline. A rank display needs a defined ordering; do not invent scores. A model diagram needs its real inputs and boundaries. Keep speculative parts visibly separate from implemented behavior.

## Redaction, when requested

Use opaque, sharp black rectangles over the actual lettering, with slight padding. White lettering on a black label is a heading, not a redaction. A thin strike-through does not conceal a word.

For an irregular, casually withheld look, mix complete labels, individual words and a few partial phrases. Vary bar lengths and coverage; preserve enough text to establish context. If names must never appear, check every caption, heading, footer, legend and table—not only the main title.

Partial coverage is an aesthetic choice only when the user wants the text inferable. For real confidentiality, use irreversible redaction, remove hidden text and metadata, and verify the exported artifact. Never present a CSS overlay or recoverable SVG text as secure redaction.

## Produce and verify

1. Read the actual reference. Identify its composition, figure scale, line treatment, typography and density.
2. Map the requested content to figures. Preserve explicit labels, implementation boundaries and any approved visual decisions.
3. Create a first complete composition. For revisions, change only what the user criticized and keep the praised version.
4. Inspect the output at its intended size. Check labels, arrows, line intersections, clipping, contrast and the actual coverage of redactions. For papers, inspect both browser and rendered PDF.
5. Save standalone figures when requested. Preserve originals and use versioned sibling outputs for visual revisions.

Measure and report actual raster dimensions. Cropping or enlarging a small plot does not recover detail. Generative standalone redraws can improve detail but are not pixel-identical extractions. For sharp arbitrary-size technical figures, deliver SVG; rasterize at the requested dimensions only when needed.

When a page is published, verify the deployed page contains and renders the new figures. This skill does not itself authorize publication, git writes, external messages or unrelated documentation changes.
