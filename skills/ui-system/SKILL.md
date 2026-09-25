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
   When asked to reuse an animated count, use the existing implementation in
   place (export a private component if needed); do not create or relocate it
   into a new primitive file as part of the visual iteration.
4. Colors/spacing/type from **existing CSS vars / tokens** (including the
   app's Tailwind v4 setup). No one-off hex/shadow stacks.
5. Match the app's look: if the app doesn't use borders/shadows/sparkles,
   neither does your feature.

## Extending an existing interaction

- Preserve existing controls when adding stacking, queueing, or depth. Support inline approvals beneath their tool row and floating approvals as distinct placements of the same stack, not a replacement of one with the other; do not restyle Run/Reject without a request. Share the gesture controller, depth geometry, resistance, release thresholds, departure and promotion motion with toasts; changing placement or content must not fork the maths. Button and keyboard decisions must produce the same perceptible card-clearing motion as a gesture, while consumers retain exact-request and approval policy ownership. Inspect live prior art such as Sonner's stacked promotion and momentum dismissal before tuning; decorative back edges and a small fade alone do not create a physical clearing sensation. Bound the visual pile and verify it in the real thread as well as floating placements. For Cursor-reference work, follow its measured single-silhouette treatment rather than preserving an older two-edge mock. Keep the host stable while the live pending list grows and drains, retain the current entry on arrival, and animate the departing card inertly. Drive counts and rear-depth visibility from live pending entries, not a fixed demo total. Exercise real tool-row additions/completions during approval so the stack cannot migrate or remount underneath a different tool.

## Shared anchored composers

- Keep one provider and one persistent panel/input outside the page column; make static bars and navigation items supply presets, optional prefills and placement requests instead of mounting editors. Verify DOM identity across open/close, preset switches and client route navigation.
- Port the reference's actual menu source and measured geometry, not a sibling's approximation or a delegate's prose summary. Include surrounding state: the resting hero launcher must fold away while subnav opens, or its uncovered white strip reads as a broken oversized menu. Check both surfaces together, including hover intent, strip controls and artwork containment.
- Reused artwork can carry conflicting Tailwind individual transforms; inspect computed `translate` as well as `transform`. Prefer the reference's plain artwork markup inside its intended container rather than layering overrides over a differently positioned component.
- On the research homepage, use the reference's badge-left/hamburger-right mobile header and blue artwork-backed accordion menu, with no header CTA/search clutter. Reuse the shared mobile modal mechanics and composer preset data, not a second editor. Keep one route-aware mobile wing launcher for singleton search: bottom-right normally, in article header chrome where the corner would cover prose. For a requested desktop proximity dock, reuse that same launcher as a centered badge, reveal on bottom-viewport pointer proximity and keyboard focus, honor reduced motion, and hide it whenever the hero or a modal/composer owns the interaction. When handing off from the mobile modal to Cmd+K, release its focus trap and scroll lock without refocusing the old trigger.
- Treat an already-open composer's keyboard/nav activation as a destination-aware transfer, not a blind toggle. Measure the input's painted bounds before changing direction or placement, then translate the same node from those bounds without replaying entrance choreography; test mid-flight reversal and query retention. Cancel pending hover on keyboard activation and ignore stationary-pointer reentry caused by the panel moving underneath it until real pointer movement resumes.
- Keep fixed viewport points independent of presets, alongside element/parent, viewport-region and cursor placement. Distinguish following an anchor from freezing its opening position; verify fixed placement while the document scrolls.
- Express placement as target (element, parent, viewport or pointer), target anchor, panel origin, offset and width policy. Measure untransformed layout height during a scale entrance: transformed bounds make a bottom-anchored panel drift. Recompute on content resize, ancestor scroll and visualViewport changes.
- Apply hover transitions to `:not(:hover):not(:focus-visible)` so entering a link is immediate. Remove surface-specific transition overrides that re-enable enter animation; transition background and foreground together on exit to avoid partially inverted rows. Verify computed hover duration and colors during rapid row-to-row movement, not only the settled color.
- Keep the composer host transparent and input opaque so color never flashes through white chrome. For subnav, animate only x/y translation on placement changes and whole-surface scale on entry/exit, anchored center-top (center-bottom for bottom docking). Use each preset's natural height immediately: no height/width tween, clip reveal, row stagger or entrance replay on preset switches. Preserve the shared header's equal-width slots; draw hover underlines and active outlines without changing their geometry.
- Center keycap glyphs using an inner cap-trimmed label, not the font's line box and descender space. Use the reference's actual SVG paths for arrows and chevrons rather than Unicode glyphs; compare opacity as well as geometry when icons appear heavier.
- Keep the composer’s trailing action icons identical across static, navigation and keyboard launch modes. Retain the shortcut note except in static-open mode, and reuse Hermes Desktop’s native-font Kbd/KbdGroup styling as a generic web primitive instead of ad-hoc shortcut text.
- Preserve partial-label hierarchy from reference source: keep a canonical string for search and explicit inline segments for muted portions, including their whitespace. Render the same segments in nav and search, and retain their relative opacity when the row inverts on hover.
- Use distinct layouts for grouped nav presets and typed search when the reference does: compact search rows should ellipsize previews to one line and omit missing-description cells. Do not force article excerpts into nav-sized description columns.
- Let wheel scrolling override selection: only keyboard-driven selection may auto-scroll, and only within the results viewport. Bypass the page smooth-scroll driver for the composer and test scrolling back to the first result after keyboard navigation.
- Anchor bottom-docked composers with CSS `bottom`, not a top coordinate derived from content height. ResizeObserver plus requestAnimationFrame corrects too late when search results shrink or reappear; sample every frame while typing repeated characters and backspacing to empty, including after viewport resize. For tall research search results, cap the whole panel at visual-viewport height minus twice its bottom inset, leaving equal top/bottom clearance at maximum height while the input stays anchored and results scroll internally; preserve in-flow and subnav placement.
- Treat the compact nav row and portaled subnav as one pointer boundary: use capture-phase tracking plus direct leave handlers so children cannot swallow dismissal. Pointer dismissal must not restore the old trigger's focus; open styling comes from the current request, while keyboard focus has a distinct cue. Keep spacing in noninteractive slots and anchor to the actual compact link border. Composer link fills enter instantly and take .7s to leave.
- Keep static-to-live composer handoff geometrically identical: no scale or translation on the white bar; animate only the results. Show the same blue input border on static-open surfaces without changing their existing border-box dimensions. During wing-square unfolding, drive mask inset and wing translation from one registered inherited CSS property, with fixed equal clearance; avoid independent animation tracks. Account for clientLeft when measuring offsetLeft and verify intermediate frames, interruption and mobile. Cmd+K must not resize the separate hero launcher. Sequence dock arrival, bar unfolding, controls and results rather than animating them all together; retain that ordering on reversal and verify both white surfaces, not just the overlay. Resolve fold masks against current dimensions to prevent cached-width jumps.
- When a folded composer has a colored edge, inspect the bar’s computed border and later chrome overrides before changing results opacity. Fade the border with the existing registered fold progress while retaining its width; this preserves the expanded border, square geometry and interrupted motion without adding another clock.
- Make Cmd+K results visibly slide upward behind the opaque stationary white bar after it unfolds; a ≤1% displacement reads as a pop, not a slide. Keep this entrance separate from static/subnav motion and never replay it on query changes.
- Give Cmd+K dismissal separate beats: clear content, fold into a wing square, hold the opaque square for 880ms, then ease out scale 1.01 and a 2px downward slide before the slower opacity fade finishes. Measure the visible wing’s displacement while still opaque, not only the last invisible keyframe; couple scale and translation timing so their geometry cannot create an upward rebound. Use scale 1.01 and a ≤1% vertical offset from the opposite side of arrival; keep existing placement translation independent, preserve the bottom edge during typing, and resume interrupted animation from its current pose. Verify the held beat with both fixed animation-clock screenshots and real elapsed time.

## Correcting an established design

- Treat criticism of a specific effect or font as a targeted correction, not permission to replace the accepted sculpture, palette, or composition. Preserve what the user praised and vary one visual dimension at a time.
- Keep research reading previews inside the measured inline-contents column and derive their labels/excerpts from live headings and source paragraphs. Cache document geometry behind RAF/ResizeObserver, ignore explorer-internal mutations, and suppress the rail until contents leave view and whenever wide media or the footer occupies its bounds. Exercise preview pointer transfer, keyboard anchors, fractional scroll rounding, and the narrow-screen contents fallback on the real article route.
- Adopt requested authoring tools without discarding a stronger existing design. A Blender migration should retain the approved silhouette and detail unless the user asks to change them.

## Matching a brand reference ("make it like X")

- Measure the reference before styling: script Playwright to dump computed fonts, sizes, weights, casing, tracking, colors, borders, @font-face sources from the live site, then design from that data. A color-and-font swap from memory reads as a costume; the user will call it "not trying".
- Extract the reference's grammar (prefix glyphs, numbering, separators, chip borders, divider style, frame) and apply it consistently across every surface, including sheets, search, overlays and the movie — not just the header.
- "Black/white" for a 3D subject means a real two-tone split (dark chrome vs bone white by material role), not one flat grey; keep the original materials swappable behind a toggle so the color edition stays one flag away.
- On dark paper, restrict the accent to prefixes, active/filled states and a hairline frame; a thick accent frame or a column of filled toggles becomes the loudest element.

- "Monotone" for a rendered object means clamping the whole tonal range, not two-tone: matte materials (low metalness, high roughness, tiny envMapIntensity), a soft even light rig, and no near-white plates or near-black undersides. Check the pedestal/base separately; a flat sky-lit plate blows out before anything else.
- Tracker/HUD labels on a 3D subject go in the side gutters, stacked without overlap, with straight leaders to the bounding bracket; never print tags over geometry. Cut to ~5 tracks and show real projected values (xyz, distance, count), not repeated placeholders.
- "Operator tool" voice: lowercase machine names, `[ bracket ]` text buttons, label-right / value-left parameter rows, three flat charcoals (canvas < panel < inset), hairline borders. Drop copywriter verbs for operator verbs.

## Settings subpage navigation

- Order Settings children from general to frequently used to specialized; General always comes first where present. Parent labels, breadcrumb links and parent URLs open the first ordered child, never an overview or the last visited child. Keep disclosure arrows independent of navigation. Use one breadcrumb header for every page without a duplicate icon-and-title heading; reusable page headings yield to this chrome while retaining actions and counts. Keep row hover fills padded on both inline edges and verify painted bounds as well as navigation.

- Split renderable control groups without keying or unmounting their config controller on sibling or parent navigation. Debounced saves and incomplete model drafts belong to the persistent, profile-keyed controller. Keep nested autosave owners at a stable React position while rendering only the selected group's controls. Derive search destinations and navigation labels from the same ordered metadata, including config-present fields omitted by the backend schema and device-local controls outside it.

## Shared theme preferences

- For monochrome documentation, neutralize the existing gray ramp as well as accent tokens; stock grays can have a blue cast. Configure the existing code highlighter's light/dark themes rather than adding another renderer. Keep artwork outside color changes and verify its framebuffer pixels remain unchanged; never grayscale the whole page.
- Share preference parsing/resolution and the OS media-query subscription across themed surfaces; keep each surface's persistence and animation adapters independent. Do not copy a second theme engine or accidentally join isolated preferences.
- Preserve cached public rendering when adding system mode. Resolve the initial research palette in its existing head bootstrap before hydration rather than adding per-request cookie reads or a mount-time light-to-dark correction. Keep serialized policy functions self-contained and reuse that same resolver in normal code.
- Prove no-flash behavior by holding external JavaScript, inspecting the intended theme before hydration, then sampling actual paper paints through hydration. Cover both OS schemes, saved opposite overrides, genuine OS flips after a manual choice, storage denial and unrelated preference preservation. Sample a color token present in both schemes, not a dark-only viewport token.

## Shared brand badges

- Consolidate Nous girl chrome into the existing shared badge component, not feature-specific image wrappers, masks, filters or copied SVGs. Preserve the original outlined/footer and filled/light-paper path sets as explicit variants with `fill="currentColor"`; color comes from the surface, not duplicate light/dark files. Use the original blue-on-light path set on light paper and the original white footer/reversed path set on dark paper or blue overlays; changing currentColor alone does not swap artwork polarity. The light variant's filled hair does not mean a solid rectangular card background. Verify the visible variant through a real theme toggle, not just path equality to the footer. Remove obsolete imports/assets and confirm exact path equality plus rendered pixel parity at equal size/color before claiming 1:1. Keep mobile-only social removal inside its breakpoint; desktop hover socials remain.

## Typography direction

- Avoid generic serif-display plus monospace-everywhere pairings for bespoke technical interfaces. Prefer a coherent family with deliberate width/weight hierarchy; use monospace only where the content warrants it.
- Self-host selected font files and their license for offline local previews. Verify the actual rendered font with browser platform-font inspection when screenshots and computed CSS disagree.
- In nested marketing shells, inspect matched font rules and actual glyph families before increasing nominal sizes: unlayered shell heading selectors can replace Condensed with Compressed while primitive sizes remain correct. Scope editorial register corrections locally. For trial fonts, report per-glyph fallback explicitly; Aeonik Fono's limited punctuation coverage cannot be fixed by repeating its CSS family name.

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
