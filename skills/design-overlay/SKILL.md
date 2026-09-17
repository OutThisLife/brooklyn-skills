---
name: design-overlay
description: Use for dimension-matched, inverted screenshot overlays.
---

# Design overlay

Use alongside `visual-verify` for Figma matching, pixel comparisons, or a request
for an inverted overlay. Keep `ui-only` and `ui-system` in force: capture and
iterate first; tests and a code diff are not visual approval.

## 1. Establish the comparison contract

- Identify the exact frame/state, reference revision, actual route/commit, and
  viewport. Preserve current product decisions and neighboring app chrome.
  A superseded Figma header or template control is a documented deviation, not
  permission to restore a rejected design.
- Use Figma for the elements it specifies; use the existing production primitive
  or screen for explicitly reused patterns. If the editor has no dedicated
  frame, say so rather than inventing a reference or claiming a full-screen match.
- Keep a ledger: state, reference, actual capture, region, measured deltas,
  accepted deviations, remaining blockers. Visual parity and functional QA are
  separate claims.

## 2. Match dimensions before comparing

1. Read the frame's actual bounds, not the surrounding Figma board. Export at
   1x and measure the saved PNG. MCP/chat images may be downscaled or include
   overlapping annotations. A thumbnail is not a native-resolution reference.
   Re-export the exact frame/subframe; do not upscale lost detail and call it 1x.
2. Set the browser viewport to the frame's CSS dimensions, with browser zoom
   100%, device scale 1, matching theme, content, language, scroll and UI state.
   Prefer a normal desktop viewport (the design's 1440px width, for example),
   then narrow/mobile widths appropriate to the product. Do not shrink a whole
   page to fit a tall board screenshot.
3. Wait for fonts, images, hydration, loading and transitions to settle. Capture
   the viewport or a measured element clip, not an arbitrary full-page height.
   Record `innerWidth/innerHeight`, DPR, `visualViewport.scale`, root font size,
   scrollbar/client width, relevant DOM rects and computed typography/spacing.
4. Preserve originals. Crop board annotations/window chrome only with explicit
   source-raster `x,y,width,height` coordinates and a named comparison scope.
   Align by the frame/containing-block origin, not by nudging the feature until
   its error disappears. A component-only crop cannot prove its page placement.
5. Verify equal CSS extents. Known 2x exports/DPR captures can be normalized
   uniformly to 1x; the bundled tool records the conversion. Never stretch axes,
   independently zoom layers, silently compare only their common area, or
   auto-register away a genuine margin/size difference. Recapture on mismatch.

## 3. Produce the overlay system

Use `scripts/compare.py` (Python + Pillow), or an existing project harness that
honors the same dimension contract. It reads two local screenshots and creates:

- Original-size side-by-side and 50/50 blend: doubled edges reveal alignment drift.
- Inverted actual over reference: matching pixels are neutral gray at 50%;
  displaced strokes remain visible. Inversion of BOTH layers proves nothing.
- Raw absolute difference: identical pixels are black; color and edge deltas show.
- Threshold mask, row/column spans and bounds for locating drift. The threshold
  is diagnostic noise filtering, not a global passing score.
- Self-contained `overlay.html`: mode switch, opacity slider, shared viewing
  zoom, 1:1 reset, grid and click-anchor measurement in CSS px and rem.
- `report.json`: provenance, native sizes, crops, density conversion, scope,
  declared deviations and diagnostic measurements. Reports start UNREVIEWED.

Example (paths are relative to the skill directory):

```sh
python3 scripts/compare.py ref.png actual.png artifacts/iteration-01 \
  --width 1440 --height 900 --root-font 16 \
  --reference-source 'Figma file/node and revision' \
  --actual-source 'Preview route, state and commit' \
  --scope 'Full viewport'
```

Use `--reference-crop` / `--actual-crop` only for a justified region comparison;
use `--reference-scale` / `--actual-scale` only for verified pixel density. Keep
capture details and any approved exceptions in repeated `--note` arguments.
The tool refuses unequal dimensions, invalid crops and overwriting evidence.
Open the HTML in the browser; inspect both the clean images and overlay modes.
A fit-to-window view is for navigation. Judge fine deltas at 1:1 or equal enlarged
zoom; view zoom affects BOTH images together and never changes their coordinates.

## 4. Turn pixels into layout fixes, not pixel-locked CSS

- Compare outer frame/gutters first, then component width/alignment, font family,
  weight, size/line-height/wrap, spacing, icons, borders/radii and states.
- Corroborate each apparent delta with DOM/Figma measurements. Font antialiasing
  can differ without a layout defect; wrong font fallback can mimic wrong size.
- Record measured CSS-pixel deltas AND the owning layout rule. Preserve the app's
  `rem`, `em`, `%`, flex/grid, `min/max`, `clamp()` and spacing-token relationships.
  Compute px→rem with the measured root font, not an assumed 16px. Correct the
  shared token or containing block; do not hardcode every measured coordinate
  or use whole-app `zoom`/`transform:scale` to force one screenshot to pass.
- Re-capture after a focused fix. Recheck mobile and an intermediate width,
  long translations, overflow and relevant open/focus/loading states. Mark
  responsive checks without a corresponding design frame as robustness checks,
  not pixel matches.

## 5. Handoff evidence

Report the exact state/viewport and verified matches, quantified remaining
mismatches, deliberate exceptions and inaccessible states. Share clean actual
captures plus the overlay/contact sheet and provenance. Do not call a UI
"design-matched" from component presence, a 200 response, or passing tests.
A blocked login/export means visual verification remains pending, not passed.

## Utility self-check

Run `python3 scripts/selftest.py` to exercise dimension refusal, explicit crops,
density normalization, known pixel deltas, inversion, provenance and output
protection. These are synthetic tool fixtures, never product QA evidence.
