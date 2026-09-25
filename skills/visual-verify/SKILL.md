---
name: visual-verify
description: Use to verify rendered UI against its design reference.
---

# Visual Verify

## Motion pieces: judge from ordered stills, not a recording

- Don't record video to judge a movie; capture 6–8 stills at fixed film-clock times (read the scene's `data-film-time`, not wall time) and tile them with ffmpeg `concat` listing files explicitly. A glob sorts `t12` before `t1_2` and the critique reads the timeline backwards.
- For beat-synced effects, multiply every effect by a hit envelope (`pow(1-phase, 4)`) so frames between beats are clean; sustained shear/split/feedback reads as mush, not rhythm. Gate the whole pass with an intensity curve that is 0 at the opener and 0 at the landing.

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
   For Figma/screenshot matching, follow [Screenshot overlays](references/screenshot-overlays.md)
   using the bundled utility or an existing harness with the same capture contract.
4. If it doesn't match, keep the debug logging and iterate. Only say "done" once
   it visibly matches.
5. Share the clean render and comparison evidence, with the viewport/state,
   measured deltas, approved deviations and unverified states. Keep visual
   parity, functional QA and the user's approval separate.

## Dense 3D inventory labels

- Compare projected label rectangles against one another and the fixed UI dock at desktop and mobile sizes. A rendered canvas or correct structure count does not prove labels are readable.
- Gate labels on projected cell width, not viewport width alone, so zoom can reveal names without overlap. Keep search and tolerant picking available when labels are hidden.
- Exercise resize without reloading an already-exploded scene. Invalidate both camera fitting and mesh transforms when the packing changes; updating only destination coordinates leaves objects in the previous grid.
- Measure inspector layout bounds independently of entry animations when reserving 3D camera space; transformed bounding rectangles can briefly report the wrong available viewport.
- Verify switch position with computed `translate` as well as `transform`; Tailwind can use individual transform properties, so `transform: none` does not mean the thumb is unmoved.

## Postprocessing previews

- Keep 3D postprocessing separate from DOM labels and controls so dither and edge detection do not damage text readability. Preserve canvas alpha so scanlines never fill the clean page background; compare a UI-element screenshot pixel-for-pixel with the effect on and off.
- Apply dependent scene/material changes atomically per file during HMR. Partially updated frame loops can throw every animation frame and flood Vite's forwarded console; inspect the latest log and HTTP health rather than treating a listening port as a working preview.
- Provide an effects bypass during visual iteration and compare actual rendered pixels with effects on/off at multiple pixel ratios. Preserve selection, camera, and isolation while switching.
- Validate the ordered-dither matrix covers its intended threshold range exactly; plausible-looking arithmetic can silently duplicate thresholds and alter the tonal distribution.
- Gate dither strength out of near-black backgrounds in a dark scene; otherwise a subtle surface effect becomes a full-screen checkerboard.
- Verify cinematic pause with both a frozen timeline and identical canvas pixels. Animate decorative rings, breathing, and camera motion from the same pausable clock.
- Prove WebGL artwork motion with timed framebuffer reads and a stable visible-artwork screenshot crop, not canvas presence or draw counts alone. When a still image and texture loader share a CDN URL, reproduce image-then-fetch in a fresh browser context: a no-CORS image response can poison the cache for the subsequent CORS texture fetch. Match the still's crossOrigin mode to the texture request, and verify normal and reduced-motion pixels without increasing effect strength.

## Isolated Vue component previews

- Import Vue through one canonical Vite alias in both the preview entry and compiled components. Mixing an explicit `node_modules/vue/dist` import with an optimized alias can create duplicate runtimes: component resolution warns, scoped attributes disappear, and loaded CSS no longer matches. Verify actual SVG children, scoped attributes, computed padding, and console warnings before judging screenshots.
- Check absolutely positioned screen-reader text inside horizontal scrollers. Without a positioned containing block it can escape overflow clipping and widen the document; compare document width before and after positioning the existing scroll region, while confirming keyboard scrolling and accessible names remain intact.
- Use an installed Chrome channel when the pinned Playwright browser executable is absent; do not substitute DOM-only output for rendered verification.
- In a fresh workspace whose shared packages export unbuilt `dist/`, run a source-based dev preview rather than triggering a build during the UI approval gate. Reuse the repo's source aliases; when the Vite config itself imports those packages, load it through the installed `tsx` with the relevant tsconfig and start Vite programmatically with `configFile: false`. Invoke binaries from the package that actually installs them: `pnpm exec` can otherwise fall through to an unrelated global Vite.
- Wait for the screen's entrance motion before capturing it. Locator visibility and `document.fonts.ready` can both precede a GSAP fade, yielding a nearly blank image or a translucent dropdown. Inspect the final pixels; label fixture-backed component checks separately from live backend verification.
- Capture an async form result at the user's unchanged scroll position before scrolling to its banner. A visible DOM node may be entirely above the viewport after insertion; a manually scrolled screenshot hides that usability failure. For fixed inner-scrolling shells, `fullPage` screenshots still show only the shell viewport, so capture both the confirmation and reachable action positions explicitly.
- When switching a feed from local assets to remote media, verify the document's actual CSP and decode visible images from every card, not merely the first card (which may be text-only). A successful API response and correct pagination can coexist with broken image placeholders; permit only the precise required image origin, then recheck real image responses and pixels.
- Verify reduced-motion copy with actual visibility and pixels, not only text content or `position: static`. A surviving `sr-only` utility may still apply `visibility: hidden` or `clip-path: inset(50%)`; remove its hiding treatment when the accessible copy becomes the visible fallback. For promotional typewriters, distinguish hidden-clock suspension from hover/focus dwell holds so the current sentence finishes without advancing the slide, and verify both phases independently.

## Saved-content component integration

- When full-route dependencies cannot be safely established within the investigation budget, mount the unchanged production consumer subtree and reread the real saved local record on every request. Compare response data to the database, exercise reload and variant/snapshot isolation, and disclose component integration rather than full-route/E2E. Keep product captures provenance-labeled and unsupported APIs explicit errors, never fabricated responses.
- Await the expanded panel's measured height and completed transition before screenshotting an accordion; `aria-expanded` can update before the expanded pixels are visible.

## Don't

- Claim a theme/color change works because the token math looks right — verify
  the rendered value.
- Delete instrumentation while the visual is still wrong.
- Trust unit tests as proof a UI renders correctly.
