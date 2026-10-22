# Engraved charts and quantitative plates

Inspect [reference-chart.png](examples/reference-chart.png). Regenerate with `scripts/generate-reference-chart.py`. It matches the net-metric charts Brooklyn actually ships: **thin smoothed daily lines per series**, one **heavier combined moving average**, a **shaded intervention band**, a **dashed event marker**, hairline grid, serif title, and a source/disclaimer line.

## Chart grammar

- **Real data only** when the chart claims measured results. The bundled chart uses synthetic series labeled as illustrative.
- **Monochrome by default:** series as stepped grays (`#444`–`#aaa`); the combined or primary trend in `#111` at ~1–1.2× the thin stroke weight.
- **Smoothing:** Catmull-Rom (or equivalent) through the **same daily points** — curves must not invent values between days.
- **Moving average:** label the window (`7-day avg`). Combined lines should deduplicate overlapping categories when the metric is a union count.
- **Annotations:** shaded bands and vertical markers without cluttering callout boxes; short italic notes beside the band or in the footer.
- **Axes:** minimal spines (often bottom + left only), light horizontal grid, readable tick labels at final size (~11–13px serif).
- **No chartjunk:** no gradients, drop shadows, rounded card frames, or default seaborn palettes on a paper figure.

## Prompt scaffold (net / backlog chart)

> Create a monochrome engraved line chart of [metric] per day from [start] to [end]. Series: [list]. Plot daily values as thin smoothed lines in gray; add one black [N]-day moving average for [combined label]. Shade [date range] as the intervention window; mark [date] with a dashed vertical line. STIX Two Text labels, hairline grid, footer note for data source. SVG with real text. No decorative icons.

## With a wireframe plate

When the deliverable is **one sheet**, put the chart in a lower band or full-width row beneath numbered wireframe figures — see [reference-plate.png](examples/reference-plate.png) for upper-band composition. Do not shrink the chart into a corner; it should read at publication width.
