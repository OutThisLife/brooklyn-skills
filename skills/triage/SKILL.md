---
name: triage
description: Use when triaging issues as a maintainer.
---

# Issue Triage

Investigate issues against current upstream, prove the disposition, and own the fix. For a real bug, consolidate competing PRs into **one maintainer-owned replacement per root-cause cluster**, preserving useful work and contributor credit. Do not bounce implementation back to reporters or contributors.

This skill is agent- and repository-independent. Use the host agent's available shell, file, search, and delegation capabilities; no particular tool API or runtime is required. Read companion skills by name using the host's skill loader or their `SKILL.md` files. Use `gh` for GitHub, `glab` for GitLab, or the forge's authenticated API. Repository instructions determine test commands and platform-specific validation.

## When to use

- `/triage <issue URLs, numbers, range, or query>`; a pasted report/thread is valid intake. Naming the skill in ordinary prose works too.
- Backlog sweeps, duplicate/resolution investigations, and issue-to-fix maintainer passes.
- PR-only review belongs to `pr-triage`; an already-owned PR's CI/reviews belong to `pr-ready`.

## Authority and scope

- **Bare `/triage` is investigate + verdict first**, like `pr-triage`. No forge writes, implementation, commits, or pushes until authorized. Behavioral probes in disposable worktrees are allowed.
- **“Fix”, “ship”, “execute”, or “go” authorizes the agreed implementation/publishing scope.** Authorization for an entire triage-and-fix sweep carries through without asking per issue. A fix-only request does not authorize unrelated closures. “Audit”, “recommendations only”, and explicit restrictions override execution defaults.
- Establish repository, selected issues, authority, and reviewed base once. Infer the current repo when unambiguous; ask only for genuinely missing scope. An unspecified `/triage` does not authorize sweeping every repo.
- **Merging requires separate authorization.** UI changes require visual approval before checks/commits/publishing under `ui-only`.
- No auto-closure for age, popularity, speculative product taste, or failed local setup. Apply the repository's contribution/closure policy. Security reports follow private disclosure policy, not public reproduction comments.

## 1. Establish the evidence base

1. Resolve canonical upstream and forge; a fork remote is not automatically upstream. Read repository/area instructions, contribution policy, and relevant maintainer decisions. Check authentication once; never expose credentials.
2. Discover the actual default branch (usually `main`), fetch it, and pin the reviewed SHA. Inspect git status/worktrees; leave the primary checkout on its default branch and untouched. Follow `work` for review/fix worktrees.
3. Enumerate exactly the requested issues, retaining explicit IDs even if a search omits them. Save full repository-qualified URLs, selection predicate, snapshot time, and base SHA. For batches, **read [references/batches.md](references/batches.md)** before starting.
4. Batch independent metadata/search/history reads. Share one immutable base and repository map; do not rediscover the repo per issue.

**Gate:** exact intake persisted; upstream/SHA known; write authority explicit.

## 2. Read, search, and cluster before fixing

1. Read the entire issue body, paginated comments/timeline, reopens, and later maintainer/reporter replies. Split compound reports into acceptance requirements, platforms, versions, configurations, and lifecycle variants. Titles/labels route investigation, not verdicts.
2. Search **open and closed issues; open, closed, and merged PRs** using exact errors, symbols, behavior, and synonyms. Inspect references in body/comments and timeline events; search git history too. Key cross-repository objects by full URL, never bare number.
3. Compare plausible duplicates by triggers, root cause, and acceptance coverage. Choose a substantive canonical tracker with active ownership, not blindly the oldest. Preserve unique evidence there when authorized. **Duplicate can still mean a real, unresolved bug.**
4. Inspect candidate PRs: full relevant diffs/commits, base/head SHAs, authors, tests, reviews, lead-maintainer feedback, checks, and landing state. A proposed patch is evidence to assess, not a ready-made answer.
5. Form **one cluster per shared root cause/bug class or inseparable failure lifecycle**. Related UI/backend/persistence phases stay together. Sharing a subsystem or filename alone does NOT justify a giant PR.
6. Record all members and unique requirements. Update ownership when evidence splits/joins clusters. Search for an existing maintainer replacement before creating another.

**Gate:** requirements and candidate clusters recorded; related work inspected, not merely linked.

## 3. Verify reality on the pinned default branch

- Trace the reported entry point through the real call chain to the failing line and sibling paths. Inspect history (`git log -p -S <symbol>`) before treating deliberate isolation/removal as a bug. Honor repository intent, not merely a plausible rationale.
- Reproduce with the narrowest real-path test/probe on the pinned base. Record command, cwd, assumptions, actual output, and artifact path. Discover the repository's supported test runner from its instructions/manifests; do not impose another project's commands. No source-text regex tests or fabricated outputs.
- Distinguish **reproduced**, **statically demonstrated**, **not reproduced under stated conditions**, and **blocked**. Dependency failures, wrong OS, missing credentials/hardware, timeouts, and unexecuted tests are not negative evidence. Do not fake host platforms.
- Configuration, identity/isolation, security, and I/O failures need actual runtime paths, not only mocked units. For cross-account/profile/tenant isolation, exercise distinct identities and switching between them with disposable state. Never test against live user data or install into a shared runtime as a shortcut. Inspect untrusted patches before execution; do not blindly run issue-supplied commands or expose secrets to contributor code.
- “Already fixed” requires current behavior covering **every** requirement and later contradiction. Verify upstream identity and `git merge-base --is-ancestor <fix-sha> <reviewed-base-sha>`: exit 0 establishes ancestry, 1 does not, and missing objects/errors are missing evidence. Fetch the object or mark the check blocked.
- A merged PR may target an unlanded feature branch, exist only in a fork, be partial, or be reverted. Inspect its full relevant change, not only the last rebase-merge commit. Trace later fixes through source history when cross-references mislead.
- Say **fixed on main/default**, not released, unless a release/tag/artifact was independently checked. Explain post-fix reports and reopens before recommending closure; “works for me” is insufficient.

**Gate:** evidence supports the verdict; missing proof is recorded, not converted into closure.

## 4. Choose a disposition

| Disposition | Required evidence / next action |
|---|---|
| **fix** | Current defect reproduced or conclusively traced. Name failing path, complete cluster, coverage, and one maintainer-owned fix. |
| **duplicate** | Canonical issue covers the same defect and all requirements. Link it and preserve unique evidence. Keep canonical open if unresolved. |
| **resolved** | Entire report works on pinned default, including later variants; cite causal fix and current validation. Closure candidate, not release claim. |
| **not-a-bug** | Positive evidence of intended behavior, unsupported configuration, or demonstrably false premise. Cite contract/history and supported path; not uncertainty or taste. |
| **feature-request** | Coherent new behavior rather than regression. Route under product policy; do not silently close as invalid. |
| **needs-evidence** | Required conditions cannot be verified. Name precise blocker and smallest missing artifact; keep open. Do not use to avoid investigation available tools can complete. |
| **skipped** | Explicitly excluded/outside ownership. Record why; not reviewed or fixed. |

Any uncovered compound requirement prevents whole-issue `resolved`/`duplicate`; preserve the residual as `fix` or `needs-evidence`. Policy-specific verdict names do not weaken proof. If policy allows negative-reproduction closures, require a faithful, decisive attempt and disclose limits; otherwise use `needs-evidence`.

A duplicate disposition does not remove its unresolved root-cause cluster from an authorized fix sweep. Fix the canonical bug once and account for duplicate reports separately, without silently expanding forge-write authority to newly discovered trackers.

Return a concise cluster verdict, evidence, and action. Investigate-only stops here with concrete next steps/draft comments. Existing batch authorization means continue, not another permission loop.

## 5. Fix once; supersede the related PRs together

1. Follow `work`: one dedicated worktree/branch per causal cluster from fresh upstream. Reconcile intervening main changes before editing. Never edit the primary checkout.
2. **Always consolidate relevant proposed fixes into one maintainer-owned merge target.** Do not approve N competing patches or ask external authors to rebuild them. Reuse an existing maintainer replacement owning the cluster. Without source PRs, make a normal issue-fix PR; never invent superseded sources.
3. Build only residual gaps after landed behavior. Cherry-pick useful commits where possible to preserve authorship; selectively adapt without importing unrelated changes. Keep a manifest of source URLs, heads, authors, reused code/tests/diagnosis, and excluded scope.
4. Credit every contributor whose work/diagnosis informed the replacement in its body. Preserve author metadata; add `Co-authored-by` for incorporated contributions using verified identities, never invented emails. Acknowledgment does not mean authorship of discarded work.
5. Fix the whole bug class and required sibling paths, not just the named example. Prove regression fails on base and passes with fix; use a small number of behavioral/invariant tests covering the acceptance matrix and actual integration path. A source patch's passing test is not complete coverage.
6. Respect unresolved lead-maintainer decisions. If a source PR has independent work outside this fix, preserve/split its ownership; never close it wholesale while discarding that work. Surface genuine scope conflicts before substantial implementation.
7. Respect `ui-only` approval gates and `ui-system` primitives. After approval, run relevant checks, record actual results, and inspect the final diff for unrelated deletions/reverts.

**Gate:** complete cluster coverage, credit, real verification; no hidden unowned residual.

## 6. Publish with CPR, then reconcile

1. **Read and execute `cpr` for every PR/MR creation or refresh.** Actually follow its `clean` → `pr-update` sequence; do not substitute an ad hoc PR-opening command. Resolve ambiguous skill names by intended path. Missing required companion skills are an installation blocker, not permission to skip them.
2. Body: root cause, behavior, acceptance coverage, real checks/limitations, every source PR's full URL under **Supersedes**, and credit. `Fixes`/`Closes` only for fully addressed issues. Partial/adjacent reports use neutral full links with NO closing keyword, even in negated prose.
3. Read back replacement URL, head, base, body, and issue links. Follow `pr-ready` through fresh green CI and resolved actionable review threads. If blocked, report it; an open failing PR is not done.
4. Only after replacement readiness, within authorized scope, comment on every fully superseded source with its replacement URL and close it. Do not delete contributor branches. Read back comment and state. Already-merged/closed sources get credit, not redundant closures.
5. **Unresolved issues stay open until the fix lands on canonical default.** A new/green PR is not resolution. Closing keywords stage closure; do not manually close as fixed because the replacement exists. After an authorized merge, verify ancestry, behavior, and issue state; reconcile stragglers.
6. Separately authorized duplicate/resolved/invalid closures need short evidence-based comments, canonical/fix full URLs, and correct repo/forge reasons. Preserve unresolved canonical issues. Use existing labels; no taxonomy creation or progress spam.
7. Re-read every exact external target after writing. On ambiguous timeout, read before retrying to avoid duplicate comments/PRs. Revalidate changed comments, states, base/head SHAs, and ownership immediately before destructive actions.

**Gate:** one ready target per cluster, source dispositions verified, no premature issue closures, all selected items accounted for.

## Batch speed and final verification

Read `references/batches.md` for multi-issue work. Inventory once; cluster before fan-out; parallelize independent read-only investigations with disjoint ownership when supported, otherwise process the same clusters sequentially. Serialize forge writes through the coordinating agent. Persist each small batch and resume from verified receipts. Optimize metadata reuse, not closure count.

- Every selected issue has a supported disposition or explicit pending/blocked/skipped state; reconcile exact URL sets, not only counts.
- Report clusters: **linked issues → verdict → decisive evidence → action/linked replacement**. Keep detailed per-issue evidence in an artifact for large sweeps.
- Distinguish **triaged**, **PR ready**, and **fixed on default**. State remaining blockers/still-open issues.
- Include reviewed base SHA and artifact path. Link every forge number with its full URL. Shipped PR work ends with canonical replacement PR/MR link(s), never closed source candidates.
