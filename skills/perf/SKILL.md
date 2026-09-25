---
name: perf
description: >-
  The general profile-driven perf loop for any language or runtime: baseline,
  profile, fix the real hot path, re-measure. Use for /perf, "this is slow",
  or optimization work.
---

# Perf

The general performance loop. Profiling (CPU profile, flamegraph, memory
snapshot, trace) is the usual tool, but the loop is the same regardless of which
one fits.

## Loop

1. Reproduce the slow path and capture a baseline number — time, memory, FPS,
   request latency, whatever matters here.
2. Profile to find the real hot path: CPU profile / flamegraph / memory snapshot
   / trace as fits. Reuse the repo's existing profiler; don't build a parallel
   harness.
3. Read the profile, not your intuition — fix the actual hot path.
4. Re-measure. Record before/after in the PR title/description.
5. Ship in topical commits (`pr-update`), `clean`, keep CI green.

## Live Electron / hgui

- Attach to the existing renderer with the repository's CDP helper and exact dev-server URL; preserve tabs, drafts and running agents. Keep source edits in the worktree and save reversible live injections outside the app's Tailwind source scan.
- Separate uninstrumented frame timing from CPU, selector-statistics and React attribution passes. Do not run your own tests/builds concurrently with comparison captures. Record mounted/visible panes and busy-session counts with each sample; persist raw samples before reporting tables.
- Treat geometry/read functions atop a CPU profile as possible flush victims. Trace `UpdateLayoutTree` and style invalidations before optimizing their callers. Isolate interacting selector families together: removing one broad `:has()` rule can show no gain while other rules still invalidate the same subtree. Preserve behavior with positively anchored owner selectors, sibling rules, or existing observed state; do not ban `:has()` generally.
- Recheck target ID, code revision, runtime state and injection globals after interruption/restart. A fresh process or independently updated checkout is a new baseline, never an after result for the old renderer. Report aged and fresh results separately; native/embedder heap growth or a GC pause alone does not prove a leak.
- Put lazy render callbacks below existing presence boundaries. `items(kit)` eagerly creates a closed menu's elements even when its portal mounts nothing; a small child component lets presence defer construction without replacing open/close mechanics. Test both dropdown and context paths plus latest-item selection.
- Verify Vite Fast Refresh's actual component family IDs before injection: local registrations and `export` registrations are distinct, and registering an already-known type under a second ID is ignored. Use the shipped `validateRefreshBoundaryAndEnqueueUpdate` export where `performReactRefresh` is private, and verify rendered markers afterward.
- Detect live render failures from boundary state or error elements, not whole-body text: this conversation's code/tool output can itself contain the error phrase. Restore instrumentation in `finally`, and describe live injections as reload-volatile.

## Web loading contracts

- Verify the delivered page's boot entry before attributing a disappearing CMS slot to async registration. In Vue, `createSSRApp` preserves existing SSR nodes while an async component loads; `createApp` clears the mount container, and `hydrateOnVisible` cannot preserve it on that client-rendered path. Exercise the real component with a held loader and assert node identity/presence; a zero rectangle in layout-shift attribution alone does not prove a DOM remount. Recheck the response from the exact browser run, including its viewport/UA and experiment cohort: a curl request and a fresh browser can receive different SSR/CSR paths for the same URL. Record real node geometry as well as identity; a node pushed outside the viewport can have a zero attribution rectangle without collapsing or unmounting.

- For cached-SSR public directories, carry only a neutral display projection through serialized store state and keep those rows mounted during a small background revalidation. Removing every client fetch can leave changed locations stale inside cached HTML. Compare original-node retention, final text/links, interactions and settled screenshots; report payload savings separately from whole-page scores, including the new SSR-state bytes.
- For personalized CMS request warming, separate public dependency identifiers from authoritative content and keep the actual visitor request on its existing service path. Prove hydrated-state availability before the remaining async route/component wait; inspect production module preloads before promising a gain. Use a manually released loader for ordering proof, never synthetic sleeps as a latency benchmark. Keep commit/validation/errors/exposure in the normal consumer, dedupe per store/context, skip existing cache hits, and verify invalidation of both settled and in-flight results. A short TTL or cookie fingerprint alone does not prove auth freshness; report manually simulated invalidation separately from wired application lifecycle coverage.
- Preserve consent-container and ordered vendor-loader contracts when refreshing a performance branch. Restoring eager GTM or upstream DY ordering changes the startup profile; label old Lighthouse numbers as historical instead of carrying them forward as proof of the new revision.
- For autofocus behind a visibility/reveal gate, wait for both initialization and reveal, consume the focus request once, and cancel it on reset. Verify the actual active element in a browser with the real hiding CSS; a mocked focus-call assertion cannot catch a silent focus no-op on a hidden iframe. Label simulated vendor-event tests separately from live SDK/environment verification.

## Product-grid browsing

- Count requested and mounted images after a fixed scroll journey, not just visible cards. Native lazy loading can still fetch hidden carousel slides. Preserve slide geometry; mount covers initially and warm adjacent photos on pointer, touch, focus and selection, retaining the original carousel mechanics.
- Separate network batches from rendered increments when each request pays substantial startup cost: fetch several screens at once, reveal the existing small card count per intersection, and prefetch one batch ahead. Keep the batch size in query keys so older short cached pages cannot falsely signal end-of-list. Test rapid reveals, crossing a batch boundary without duplicate requests, correct end-of-list behavior, and reset/isolation across sort/search/filter keys; never mount the entire buffer or recursively crawl the whole feed.
- When persisting only an infinite query's first page, preserve that page's own fetch age. Appending later pages advances the query timestamp but must not extend stale prices or stock. Bound storage, retain background revalidation, and test fresh reloads with delayed real network responses plus expired-snapshot rejection.
- Report cold catalog loads separately from warm server and restored browser caches. A warm rerun is not evidence that a cold upstream walk became faster; compare identical revisions, viewport/device scale, product counts and scroll steps, saving raw timings and profiles.

## Serverless catalog caches

- Verify cache behavior after restarting the process and again on the deployed platform; a warm local Map can hide repeated multi-second catalog walks on new serverless instances. Compare exact product IDs/order/prices across the cache change, not only response timing.
- In Next, move a Pages API handler to a real App Route when it needs persistent Data Cache SWR and `after()` lifetime support. Wrap overloaded Apollo integrations in a request-only adapter for Route Handler typing, and externalize `graphql` alongside `@apollo/server` so schema class identities stay shared.
- Measure upstream page sizes before caching. Large Shopify pages can exceed the Data Cache's 2 MB entry budget; cache compressed validated pages and decompress losslessly, rather than dropping fields or storing one oversized full-catalog entry. If keeping decoded in-memory catalogs, carry the oldest upstream page's original fetch timestamp through persistent storage; cache reads must not restart that TTL. Bound the decoded-cache entry count.
- Treat throttling, invalid payloads and required-page failures as errors, never end-of-catalog. Consume concurrent speculative pages in order, stop only at a successful short page, and safely settle remaining requests within the response lifetime; failed refreshes must not replace valid stale data with empty arrays.

- Benchmark a trivial empty query when deployed latency remains high despite data caching: function startup alone may dominate. For public read-only GraphQL, use GET with a bounded-URL POST fallback and the required Apollo preflight header; cache only successful, non-authenticated JSON responses at the CDN for a short window. Verify real `x-vercel-cache: HIT` and keep cache-miss versus cache-hit timings separate. Update browser test request parsing and route interception for query-string GETs.

- Inspect every entry in an IntersectionObserver delivery when a ready grid stalls at the sentinel. Rapid scrolling can coalesce a leave and re-entry for the same observed target; use its latest entry, not `entries[0]`. Record native batches and query readiness before blaming React closures or the network, then stress rapid successive reveals across data-batch boundaries.

## Browser idle and retention

- Assert the browser's actual `innerWidth`, `innerHeight`, DPR and theme for every named case; requested launch options are not proof. Use explicit units in sampling helpers and reject accidental millisecond/second mismatches. Exclude failed/misconfigured runs instead of folding them into a coverage total.
- Separate stationary idle counters, frame-cadence probes, CPU/paint traces and heap snapshots. RAF cadence is not proof of presented GPU frames. CDP GPU-process CPU time is not hardware GPU utilization.
- Assert scroll trajectory as well as cadence: replay wheel input across nested scroll-region boundaries in both directions, record per-frame scrollY, wrong-direction deltas and total requested travel. A page can report 60 FPS while native scrolling fights an in-flight Lenis animation. Use axis-specific prevention for horizontal carousels inside vertical pages, retain truly independent native vertical regions, and verify horizontal wheel/drag/keyboard behavior separately.
- Compare post-GC retention after code/data caches warm, with equal mounted content and genuine same-document route cycles. Inspect retaining paths when detached nodes remain. Heap snapshots and DevTools network response buffers can inflate native RSS; distinguish bounded caches/tooling overhead from growing app retention.
- When a persistent React owner returns null off-route, bind DOM-owning motion effects to that presence boundary. Clear Element-keyed interruption maps when the panel disappears, but preserve them for reversals on the same mounted panel. A real Chrome fixture using the exact source, native WAAPI and WeakRefs can verify release independently of unavailable full-route infrastructure; label it isolated component verification.
- Preserve exact gradient stops/tokens when moving an animated background onto a transformed layer. Compare fixed-clock edge pixels at endpoints and midpoint before accepting performance gains; a faster changed design is not parity. Derive transform percentages from the actual background positioning geometry.
- Keep autoplay media paused off-screen, while hidden and under reduced motion; observe live preference changes and disconnect ownership on unmount. Use the latest entry in coalesced visibility batches. If a headless tab never becomes hidden, report native-background coverage as unverified rather than treating a tab switch as proof.
- Preserve each animation's initial play state in A/B/A probes. Calling `play()` on an initially paused closed-panel effect manufactures work and invalidates the native control; restore only the owners that were running. Save the exact harness/module versions with each capture.
- Isolate RAF drivers and CSS/compositor animations both individually and together. An otherwise cheap RAF can keep main-thread style sampling active while an independent compositor animation still consumes GPU-process CPU. Verify the actual mounted canvas/owner at named waypoints rather than attributing a footer shader to a nearby sigil or trusting a stale component comment.
- Obtain design approval before introducing an inactivity cutoff for approved ambient decoration; pausing visible motion is a product trade-off, not a free rendering optimization. Preserve the approved grace period, suspend on document leave/blur, ignore transitions between document children, and verify native pointer re-entry plus keyboard recovery. Label measurements from a superseded timing policy instead of relabeling them as final.
- Verify demand-driven animation against the real engine, not only a mocked scheduler: wheel, anchors, programmatic and native scrolling, locks, hidden/resume time continuity, settle, and teardown. Decorative idle suspension should freeze its last pose and resume active-time clocks; compare idle screenshots and callback/draw counts so a blank canvas cannot pass as an optimization.

## SSR responsive-image request selection

- Compare the actual component's `renderToString` output, serialized state and `createSSRApp` hydration with an SSR device bucket opposite Chrome's viewport. Hold vendor readiness and data responses independently; record initial requests, mount-only requests, branch transitions, image geometry and hydration warnings. Native `picture` sources plus CSS sizing avoid UA-driven source swaps; preserve the existing media-aware SSR preload contract rather than adding a conflicting fallback-image preload. Check pre-hydration `complete && !naturalWidth` as well as later error events, then prove interactive handoff still proceeds. For billable image APIs, intercept every browser request before navigation, reject unexpected keys, and fulfill only explicitly nonsecret URLs with labeled synthetic images. This proves request selection and geometry, not cartography or page-level LCP gains.

## Don't

- Optimize by guess before profiling.
- Fiddle with the measurement system instead of improving perf.
- Run a full suite or profile that overwhelms the machine — scope the run.
- Report gains you didn't measure.
