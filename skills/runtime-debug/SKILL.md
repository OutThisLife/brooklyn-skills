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

## Don't

- Rewrite code speculatively before reading logs.
- Report fixed without re-checking the runtime.
