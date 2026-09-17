# Dimension-matched screenshot overlays

Use this procedure for the reference-comparison step of `visual-verify`.
The tools require Python and Pillow; paths below are relative to the skill root.

## Establish the capture contract

- Identify the exact frame/state, reference revision, actual route/commit and
  viewport. Preserve approved product decisions and neighboring app chrome.
  A superseded Figma header or template control is a documented deviation, not
  permission to restore a rejected design.
- Use Figma for the elements it specifies and the existing production screen
  for explicitly reused patterns. If the editor has no dedicated frame, name
  the baseline used rather than inventing a reference.
- Record each state, its reference and actual captures, comparison region,
  measured deltas, accepted deviations and remaining blockers.

## Match dimensions

1. Read the frame's bounds, not the surrounding board. Export at 1x and measure
   the saved PNG. MCP/chat images may be downscaled or include overlapping
   annotations. Re-export the exact frame/subframe if necessary; do not upscale
   a thumbnail and call it native-resolution evidence.
2. Set the browser viewport to the frame's CSS dimensions, with browser zoom
   100%, device scale 1, matching theme, content, language, scroll and UI state.
   Use the design's intended viewport, then narrow/mobile widths appropriate to
   the product. Do not shrink a page to fit a tall board screenshot.
3. Wait for fonts, images, hydration, loading and transitions to settle. Capture
   the viewport or a measured element clip, not an arbitrary full-page height.
   Record `innerWidth/innerHeight`, DPR, `visualViewport.scale`, root font size,
   scrollbar/client width, relevant DOM rects and computed typography/spacing.
4. Preserve originals. Crop annotations/window chrome only with explicit source-
   raster `x,y,width,height` coordinates and a named scope. Align by the frame
   or containing-block origin, not by nudging a feature until its error vanishes.
   A component-only crop cannot prove its page placement.
5. Verify equal CSS extents. Known 2x exports/DPR captures can be normalized
   uniformly to 1x; record the conversion. Recapture on a layout mismatch rather
   than stretching axes, independently zooming layers, silently comparing only
   their common area or auto-registering away a margin/size difference.

## Compare

`scripts/compare.py` creates:

- Original-size side-by-side and 50/50 blend images. Doubled edges reveal drift.
- Inverted actual over reference. Matching pixels are neutral gray at 50%;
  displaced strokes remain visible. Inverting both layers defeats this check.
- Raw absolute difference. Identical pixels are black; color/edge deltas show.
- Threshold mask, row/column spans and bounds. The threshold filters diagnostic
  noise; it is not a global passing score.
- Self-contained `overlay.html`: mode switch, opacity slider, shared viewing
  zoom, 1:1 reset, grid and click-anchor measurement in CSS px and rem.
- `report.json`: provenance, native sizes, crops, density conversion, scope,
  declared deviations and measurements. Reports start UNREVIEWED.

```sh
python3 scripts/compare.py ref.png actual.png artifacts/iteration-01 \
  --width 1440 --height 900 --root-font 16 \
  --reference-source 'Figma file/node and revision' \
  --actual-source 'Preview route, state and commit' \
  --scope 'Full viewport'
```

Use `--reference-crop` / `--actual-crop` only for a justified region comparison;
use `--reference-scale` / `--actual-scale` only for verified pixel density. Add
capture details and approved exceptions with repeated `--note` arguments.
The tool refuses unequal dimensions, invalid crops, thumbnail upscaling and
output directories that would overwrite earlier evidence.

Inspect both clean captures and the overlay modes. Fit-to-window is for
navigation; judge fine deltas at 1:1 or equal enlarged zoom. Viewing zoom scales
both images together without changing their coordinates or the product.

## Translate deltas into layout corrections

- Check outer frame/gutters first, then component size/alignment, font family,
  weight, size/line-height/wrap, spacing, icons, borders/radii and states.
- Corroborate apparent deltas with DOM/Figma measurements. Font antialiasing can
  differ without a layout defect; font fallback can mimic a wrong size.
- Record CSS-pixel deltas and the owning layout rule. Preserve `rem`, `em`, `%`,
  flex/grid, `min/max`, `clamp()` and spacing-token relationships. Compute
  px-to-rem with the measured root font, not an assumed 16px. Correct the
  token/containing block rather than hardcoding each coordinate or applying
  whole-app `zoom`/`transform:scale` to force one screenshot to pass.
- Re-capture after a focused fix. Check mobile and an intermediate width, long
  translations, overflow and relevant open/focus/loading states. Without a
  corresponding design frame, label these responsive robustness checks rather
  than pixel matches.

Return clean actual captures, overlay evidence, provenance and the specific
remaining/accepted deltas to the main `visual-verify` handoff. A blocked login
or export leaves that state unverified.

## Utility self-check

`python3 scripts/selftest.py` exercises dimension refusal, explicit crops,
density normalization, known pixel deltas, inversion and output protection.
These synthetic fixtures verify the utility, never a product screen.
