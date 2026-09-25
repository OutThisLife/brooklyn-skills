---
name: runtime-debug
description: >-
  Debug broken runtime/environments by checking logs and observability first,
  then code. Use when a URL, deploy, or ephemeral/CI environment fails at
  runtime rather than a local code bug.
---

# Runtime Debug

When something breaks at runtime (a URL 500s, a deploy is down, an ephemeral env
misbehaves), look at what actually happened before editing code.

## Steps

1. Reproduce and capture the real failure (status, error, request id, time).
2. Check observability first: logs, traces, metrics. Use an observability MCP
   (e.g. Datadog) if one is available/connected; otherwise fall back to the
   platform's log stream (CI job, container, Jenkins, cloud logs).
3. Locate the failing service/line from the evidence, not a guess.
4. Fix the real cause. Don't add logging-only "fixes" and call it done.
5. For intentional lab/ephemeral config (test secrets, fail-open), don't raise
   false alarms — leave required env in place.

## MR local preview

- For a requested local link, start the actual worktree app against existing Docker datastores; do not substitute a screenshot gallery. Check Docker Desktop and existing containers first, then use the worktree's Node 18.20.4 and explicit `NODE_ENV=local` / `NODE_PATH`. Verify `/200` and the requested page separately: a healthy server can still return 404 when Mongo has no CMS content.
- Inspect local CMS collection counts before attempting a restore. An empty Atlas Local container needs sanitized seed data; inspect cached archives and download size before starting a large refresh, especially on constrained connections. Never reset or reseed existing data just to start the server.

## Research preview latency

- Separate middleware TTFB from image/render timing before changing public pages. In the portal app, a local preview with unconfigured Upstash Redis can spend seconds retrying rate-limit calls even when the page itself is static.
- Reuse the existing Docker Redis and serverless-redis-http services and their mapped ports. Verify the HTTP pipeline and then the page's rate-limit headers after reconnecting the preview; never bypass production limiting to make a local timing look fast.
- Use headed Chrome when Vercel's preview checkpoint rejects curl/headless requests. Attribute third-party preview-toolbar exceptions by their stack URL rather than hiding all page errors. Compare an exact artwork element crop for reduced-motion proof; full screenshots include animated preview chrome.

## pnpm deployment installs

- Treat a failed frozen install as a deployment blocker even if invoking Next directly builds successfully. For `ERR_PNPM_IGNORED_BUILDS`, inspect the exact dependency lifecycle scripts and the tracked `pnpm-workspace.yaml`; pnpm may generate ignored placeholder decisions locally. Commit explicit reviewed version-scoped allow/deny decisions, keep strict checking enabled for unknown versions, and verify the normal frozen-install/build path before redeploying.

## Don't

- Rewrite code speculatively before reading logs.
- Report fixed without re-checking the runtime.
