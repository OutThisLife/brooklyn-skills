# Large issue sweeps

Read before multi-issue triage. This is an execution protocol, not another verdict taxonomy. Keep SKILL.md's authority and evidence gates. Use the host agent's available tools; parallel delegation is an optimization, not a prerequisite.

## Stable selection, exhaustive pagination

- Save immutable `inventory.json` in a durable, git-ignored task directory OUTSIDE disposable worktrees. Store repository, exact predicate/range/list, timestamp, pinned default SHA, page/cursor receipts, and selected issue URLs. Scratch is for expendable probes, not the only record of a long-running sweep.
- Resolve explicit input numbers in the canonical repo; deduplicate by full URL, never by number across repos. GitHub's repository issues endpoint includes PRs: exclude objects containing `pull_request`.
- Page to exhaustion. List defaults, one GraphQL connection, or a “large enough” `--limit` are not completeness. GitHub search has a 1,000-result ceiling: use repository pagination or partition into exhaustive nonoverlapping created-date/ID windows, validating each window. Reconcile overlaps programmatically when date precision forces them.
- GitHub command template: `gh api --paginate --slurp 'repos/OWNER/REPO/issues?state=all&per_page=100'`. Substitute the canonical repository. Parse/flatten arrays of pages and filter by the requested predicate. Persist large outputs rather than dumping them into model context; check every page completed successfully.
- Page `issues/N/comments` and `issues/N/timeline` too. REST/GraphQL shapes differ. Timeline `source` and `subject` references are leads: resolve actual repository, PR state, base, merge commit, and ancestry.
- GitLab: authenticated API with its pagination headers/cursors; check installed `glab api --help`, not assumed GitHub syntax. Keep issue IIDs project-qualified. Other forges use equivalent identity, pagination, and state checks rather than silently borrowing these endpoints.
- Freeze intake membership: later issues belong to the next pass unless scope expands. At the end compare against the SAME frozen selection or explicit input IDs, not today's mutable open-state filter. Refresh member state separately.
- Assert received pages cover intended input. Missing/inaccessible pages or explicit issues stay pending/blocked; never silently drop them. Search hits are not reviewed issues.

## Cheap routing, then real investigation

1. Page inventory metadata; cache repo policy, labels, relevant PR catalog, and pinned source map once.
2. Route likely clusters using symptoms/symbols. These are hypotheses: the cheap pass may prioritize but cannot issue closure verdicts.
3. Fetch full detail per cluster. Cache by full URL + observed update timestamp/head SHA; save raw responses and pass investigators evidence paths and focused summaries. Timeline/check changes can require fresh reads even if body timestamps match.
4. Prioritize security/data loss and high-impact regressions, then well-evidenced clusters; age is not correctness. Difficult items must not disappear behind easy closure counts.
5. Reuse reproductions/source analysis across true duplicates, but compare EVERY member's unique requirements and later comments.

## Ownership and checkpoints

- When delegation is available, assign one worker per independent cluster, not overlapping issue/PR. Supply exact owned URLs, repo, base SHA, authority=read-only, requirements, output schema, and artifact paths. Workers return evidence/findings, never forge writes/closures. The coordinating agent reconciles and applies transitions. Without delegation, process the same ownership units sequentially.
- Respect actual concurrency/API limits. Honor rate-limit headers and Retry-After with bounded waits; no busy polling or redundant searches. Do not invent a concurrency cap.
- Workers write separate shards; coordinator merges/deduplicates programmatically. No concurrent unprotected JSONL appends or shared worktree/branch edits.
- Checkpoint small batches (roughly 10–25 issues as a starting point, not a selection limit). Keep `inventory.json`, `reviews.jsonl`, `sources.json`, `actions.jsonl`, raw details, and test logs together. Handoffs include absolute paths and exact pending URLs.
- Resume from disk, not model memory. Reuse unchanged evidence; invalidate findings affected by new main commits, replies/reopens, changed PR heads, or ownership. An interrupted attempt is pending, not completed.
- Escalate expensive/blocked cases explicitly and continue independent clusters. Time budgets change scheduling, never closure proof.

## Record contract

Structured records, not prose-only verdicts. One inventory row per selected full URL; one latest review per URL in the aggregated view, earlier attempts retained in an append-only revision/timestamp trail.

**Inventory**
- `run_id`, `repository_url`, `selection`, `selected_at`, `base_sha`.
- `issues`: array of `{url, observed_updated_at}`. Membership is immutable.

**Review**
- `url`, `cluster_id`, `reviewed_base_sha`, `observed_updated_at`, `reviewed_at`.
- `status`: `pending | reviewed | blocked | skipped`; `disposition`: SKILL.md verdict, or null while pending. Use blocked for `needs-evidence`, skipped for `skipped`, and reviewed for the other evidence-backed verdicts. Pending means investigation has not yet reached a disposition.
- `requirements`: each case with evidence and `met | failing | unknown` result.
- `canonical_issue_url`, `related_pr_urls`, `fix_commit_urls`, `ancestry_result` when applicable.
- `evidence`: permalink or `path:line@sha`, command/cwd/result/log path, rationale. Distinguish actual execution from static reasoning.
- `blockers`, `next_action`, `replacement_pr_url`, and recommendation versus applied action.
- `automerge`: eligibility/rationale, reviewed head SHA, requested method, observed state (`not-requested | enabled | unavailable | disabled | merged`), and verification timestamp. Assess each replacement independently; one safe PR does not authorize auto-merge for the whole batch.

**Source manifest**
- PR URL, base/head/merge SHA, authors, contributions, residual coverage, credit, intended disposition. Include landed sources so salvage cannot reintroduce their obsolete behavior.

**Action receipts**
- Authorized operation, exact target URL, precondition observations, evidence revision.
- Resulting comment/PR ID or URL, expected state/body/head, read-back observation/time, and `planned | applied | verified | blocked` status.
- Read remote receipts before retry; never blindly replay an interrupted batch. Exclude credentials/private logs from artifacts/comments.

## Final reconciliation

Use an available scripting runtime to load persisted files and compute these checks, not mental counting:

1. No duplicate inventory URLs; every review/action target is owned or explicitly a related source, never silently added to issue totals.
2. `selected_URLs == reviewed_URLs | blocked_URLs | skipped_URLs | pending_URLs`, with pairwise disjoint sets. Assert identity, not just equal counts; report missing/unexpected URLs.
3. Pending is zero before claiming the investigation sweep completed. Blocked remains blocked even if all workers returned; show reviewed, blocked, skipped, and pending totals separately. A fully accounted-for sweep with blockers is not an all-resolved backlog.
4. Every reviewed disposition passes its evidence gate. Closure candidates need all requirements covered, no unexplained post-fix contradiction, and fresh state checks. Validate every closure individually; random sampling is insufficient.
5. One active maintainer replacement per causal cluster; every required variant/source contribution has an owner. Count issues, clusters, replacement PRs, superseded source PRs, and verified closures separately.
6. Planned writes are not applied; applied without read-back is unverified. Remote totals derive from verified receipts. Query exact targets again and reconcile partial failures.
   Rebase auto-merge enabled is not merged: verify the requested method/head, record unsupported-repository blockers, and count actual landings separately from queued PRs. Reassess and disable pending auto-merge if new evidence or revisions invalidate the risk gate.
7. Reconcile any source-catalog total against enumerated pages under the SAME filter/time semantics. Discrepancy blocks claiming completeness; never just report the smaller total.

## Public comments

Short, factual, kind; follow `no-tropes` before posting. One useful disposition comment, not progress spam. Cite evidence rather than “AI triage says”.

- Duplicate: “Tracked in <canonical URL>: <shared cause>. <unique evidence preserved there, if any>.” Do not imply fixed.
- Resolved: “Verified on <default SHA permalink>: <behavior/variants>. Fixed by <causal PR/commit URL>.” Only add release claims with independent verification.
- Superseded PR: “Superseded by <replacement URL>, incorporating <contribution> and covering <scope>. Thanks @author.” Close only when ready and all relevant work has a home.
- Needs evidence: “<what was checked>. Could not verify <condition> because <blocker>. Needed: <smallest artifact>.” Leave open; never request information already in the thread.

## Operator summary

Compact cluster table with linked replacements, exact totals, and evidence path. List pending/blocked items with precise missing proof. Do not flood chat with thousands of summaries or call triage/PR readiness “all fixed”.
