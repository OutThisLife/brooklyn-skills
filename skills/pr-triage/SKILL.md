---
name: pr-triage
description: >-
  Maintainer triage on OTHER people's PRs/MRs — verdict of approve, supersede,
  or close, salvage with credit, close the cluster. Use for a review batch, a
  pasted Discord thread with a PR, or salvage/supersede/close asks. Not for your
  own PR (that's pr-ready).
---

# PR Triage

Maintainer triage. Three real outcomes: **approve**, **supersede** (salvage +
credit + close the old one), or **close** (wrong premise). Verdict first; wait
for an explicit **go** before forge writes (approve / supersede / close / merge /
push). Use `gh` or `glab`.

## Explicit review scope

Treat the user's stated outcome set as overriding the default taxonomy below. If they request **approve or request changes only**, review each MR on that basis: report concrete blockers as request changes, and do not consolidate, supersede, close, or implement a replacement. Keep the verdict-first / explicit-go boundary for forge writes.

## Kickoff

Batch ("we will be reviewing…") or a pasted Discord/`>>>…<<<` thread with a PR:

1. Figure out repo + forge. Skim `AGENTS.md` / `CONTRIBUTING.md` if present.
2. Match this repo's worktree/branch naming by inspecting existing worktrees.
3. Don't touch the primary checkout — use worktrees.
4. **Cluster the batch first** (below), then verdict + salvage plan; wait for go
   before forge writes.

## Cluster the batch first (before per-PR verdicts)

More than one PR/issue in front of you? Group them by the **fix they need**
before you judge any single one. Multiple PRs on the same bug (or fragile
subsystem) are **one consolidation**, not N salvages.

1. Map each PR/issue to the underlying fix and the files/subsystem it touches.
2. Any two that fix the **same bug class or the same subsystem** → treat the
   group as **one super-PR**: build the proper fix once, credit **every**
   author (`Co-authored-by` + `@handle`), and supersede the whole cluster.
3. Default to consolidation. Only keep PRs separate when the fixes are genuinely
   independent (different bug class, different area, no shared code).
4. State the grouping up front, e.g. `#68665 + #63590 + #67603 → one super-PR`,
   then run the per-PR loop **within** each group to confirm premises.

Do **not** enumerate one verdict per PR when they share a fix — that's the lazy
shape. One cluster → one consolidated supersede.

## Discord threads

A pasted thread *is* the intake. Don't make them restate a bare URL.

1. Pull out symptom, platform, linked PR/issue, what staff already said.
2. Open those PRs; look for siblings on the same fix.
3. Run the per-PR loop. Check the PR actually matches the reported bug.
4. Draft a user reply only if useful — still wait for go before GH actions.
5. No PR? Search open ones; if they want a new fix, follow that repository's
   worktree workflow.

## Issue-only closure audits

- Follow the user's issue verdict taxonomy rather than applying PR supersede outcomes. A reachable fix commit is a lead, not proof that the entire issue is solved; read later comments and test the present implementation.
- Honor explicitly assigned issue numbers even when their PR references appear only in comments; timeline-based batches do not implicitly own them. Only exclude merged-reference issues when the assignment expressly says to. Inspect references in the body and comments as well as timeline cross-references, resolve object and merge state live, and record actual exclusions as skipped rather than solved. A historical, partial, or unrelated merged reference is not resolution evidence.
- Preserve the reviewed base SHA in machine-readable results. Separate closure candidates, substantively unresolved issues, and skipped ownership cases in totals; inherit labels on skips only with an explicit unassessed qualifier.
- Distinguish external-repository merges from upstream implementation. Check the referenced repository and `git merge-base --is-ancestor <merge> <reviewed-base>`; exit 128 for an unavailable commit is missing ancestry evidence, never proof of inclusion or exclusion. For oversized PR diffs, recover the issue-relevant patches with paginated `gh api repos/<owner>/<repo>/pulls/<number>/files --paginate --slurp` rather than trusting a truncated file list.
- Re-enumerate a range-limited catalog independently before writing verdicts, using the exact source/subject merge predicate requested. Assert selected IDs equal reviewed IDs, not just equal counts, and retain later human reports and unresolved acceptance requirements even when a sibling fix merged.
- For merged-reference issue batches, derive and count the exact selection from both timeline `source` and `subject` objects. Preserve external-repository references: a merged fork/plugin PR is not upstream coverage, and `merge-base` exit 128 means an unavailable object, not a proven non-ancestor.
- Read reopen events and post-fix reports before proposing closure. GitHub can auto-close from a negated phrase such as “does not fix #N”; a test-only or sibling PR linked that way is not a production fix.
- For merged-reference issue audits, check the PR's base branch and `git merge-base --is-ancestor <merge-sha> <reviewed-main-sha>` before treating it as landed. Stacked fixes can be marked MERGED into an unlanded feature branch; absent feature code on main is not proof that a pre-merge bug report is resolved. Conversely, inspect current code and its history for later fixes outside the issue timeline so an unrelated reference does not hide an actual resolution.
- When the desktop Vitest workspace cannot load a missing build plugin, do not install dependencies during a read-only audit. A scratch standalone config can run source-level suites with the app's aliases, React/ReactDOM package resolution and existing setup file, without extending its Vite build config. Label this as alternate-config testing, not packaged Electron verification. Scratch hook probes must execute actual imports, never regex-match source.

## Issue audits with merged cross-references

For recommendation-only audits, preserve that boundary: no forge writes, even when a related PR is merged.

- Enumerate the full requested issue set programmatically from structured source/subject references; save the input IDs and assert the final reviewed IDs match exactly.
- Read issue bodies, all comments, and timeline events before treating a merged PR as resolution. Flag reopens and distinguish post-merge reproductions from comments predating the fix.
- Verify each merge commit is an ancestor of the exact reviewed main SHA, then inspect the current code. A related PR, stale closure trailer, or mitigation is not full acceptance evidence.
- Separate every reported requirement and later variant. Recommend closure only when all are addressed with high confidence; otherwise name the concrete residual or unverified acceptance case without claiming it still reproduces.
- Record test commands and actual results, including startup blockers and alternate test configuration. Unit recovery tests do not prove native-app geometry, update-time permissions, or cross-profile end-to-end isolation.
- Draft closures with complete PR/source URLs and say fixed on main, not released, unless the release artifact was separately verified.

## Forge cheatsheet

| Action | GitHub | GitLab |
|--------|--------|--------|
| View | `gh pr view <N>` | `glab mr view <N>` |
| Diff | `gh pr diff <N>` | `glab mr diff <N>` |
| Comment | `gh pr comment <N>` | `glab mr note <N>` |
| Review | `gh pr review <N> --approve \| --request-changes` | `glab mr approve` / note |
| Close PR/MR | `gh pr close <N>` | `glab mr close <N>` |
| Close issue | `gh issue close <N>` | `glab issue close <N>` |

```bash
git fetch origin pull/<N>/head:refs/remotes/origin/pr-<N>   # GitHub
# GitLab: glab mr checkout <N>
```

## Per-PR loop

Run this **within each cluster** (see "Cluster the batch first"). If the group
consolidates, the salvage plan is shared and you supersede all of them into one
super-PR — don't emit a standalone salvage per member.

1. Metadata + diff + existing reviews (`gh` / `glab`).
2. Unaddressed **#1 / lead maintainer** comments → do not approve.
3. Check the premise on current default branch (usually `main`).
4. Cherry-pick/apply in a review worktree; run targeted tests this repo uses.
5. Return a verdict:

```markdown
**PR/MR:** [#N](https://…/pull/N)

**Verdict: approve | supersede | close-as-wrong-premise**

**Worktree:** `…` · `<branch>`

### Why
- …

### Checks
| Check | Result |
|---|---|
| Merges onto default branch | … |
| CI | … |
| Targeted tests | … |

### Next (after go)
- approve: …
- supersede: salvage plan (reuse X, drop Y, tests Z, credit @handle)
- close: wrong-premise comment outline
```

## Pick the verdict (no soft exits)

| Situation | Verdict |
|-----------|---------|
| Idea + shape are fine | **approve** |
| Idea is right, shape is wrong (wrong helper/layer, missing tests for the bug class, contaminated, stale/conflicting, duplicate of another PR, ignored lead feedback) | **supersede** |
| Premise doesn't hold on current default branch | **close-as-wrong-premise** |

**Anti-patterns — do not do these:**

- `keep open — ask the author to rewrite / reuse helper X / add coverage`
  when the shape is already wrong → that **is** supersede. You salvage it.
- Inventing a fourth outcome (`request-changes`, `needs-info`, `wait-and-see`)
  for external PRs that need reshaping.
- Emitting one verdict per PR when several fix the same bug/subsystem → that's
  **one** consolidated super-PR that supersedes the cluster, credit all authors.
- Parking on someone else's confirmation when the PR's *shape* is already a
  supersede (wrong helper, wrong layer, no bug-class tests). Note the open
  question under Why if useful; still verdict **supersede** with the salvage
  plan. Only block the verdict when you literally cannot tell whether the
  reported bug is this codepath vs something else — and even then say what
  evidence would flip it, don't default to "ask the author."

`request-changes` is **not** a triage verdict. It is only for **trusted /
internal** authors with a **single tiny nit** under Approve — never for
"please rebuild this correctly."

## Trusted / internal authors

Infer from organization membership, team roles, prior maintainer behavior, or
the user explicitly identifying someone as a lead/internal contributor.

| Who | Default |
|-----|---------|
| **#1 lead** | Prefer approve/merge. Don't supersede automatically. Never approve over their open review comments. |
| **Other internal** | Prefer approve. One tiny nit → ask them (request-changes). Needs a real rewrite → **supersede** (or they bounce it to you). |
| **External** | Normal bar. Idea right / shape wrong → **supersede** with credit. Never "ask them to rebuild it." |

## When to supersede

- Contaminated / wrong close keywords
- Stale conflicts, author not fixing
- Duplicates a helper / wrong layer / wrong issue
- Missing tests for the bug class while the idea is right
- Same bug across 2+ PRs → one shared fix
- Lead feedback ignored and the idea is still right

Not enough alone: taste nits, optional follow-ups, "could be prettier."

## Supersede (only after go)

This is the default salvage ritual — not a rare escalation.

1. **One** salvage worktree for the whole cluster — not one per PR.
2. Keep the good idea; drop junk; reuse existing helpers (don't re-ask the
   author to). Check what already landed on the default branch first — part of
   the cluster may already be fixed, so build only the residual gaps.
3. Credit **every** author in the cluster: cherry-pick or `Co-authored-by` +
   `@handle` for each in the body.
4. Tests for the bug class; green.
5. Open **one** new PR/MR: `Supersedes #N, #M, …` for all members;
   `Closes`/`Fixes` only for issues it really fixes.
6. Close the cluster (below).
7. Run `no-tropes` on public comments.

Templates: [reference.md](reference.md).

## Close the cluster

After supersede or a merge that kills siblings:

1. Close every superseded/sibling PR/MR for that fix — comment `Superseded by #<new>.`, then close.
2. Close related issues this work actually fixed (`Closes #` on the new PR, or close by hand).
3. Don't close issues for a different bug class.
4. "Supersedes" does not auto-close other PRs — you close them.
5. Audit asks → page recent supersedes/merges, close stragglers, report counts.

## Approve (after go)

- Short approve (or merge if asked). Credit stays with the author.
- Fork PR with CI `action_required`: approve each run (`gh api -X POST repos/<o>/<r>/actions/runs/<id>/approve`, ids from `actions/runs?head_sha=<head>`) so CI actually runs, then merge with `--auto`.
- Before `--rebase --auto`, check `gh api repos/<o>/<r>/pulls/<N> --jq .rebaseable`. A branch that merged main over a conflict is `false`, and the rebase merge will fail. Never switch to squash or merge commits: she wants rebase only. Rebase the branch onto main yourself (maintainer push to the fork, or ssh if it touches workflows), push with lease, then arm `--rebase --match-head-commit <new-sha>`. If you can't push to the branch, report it.
- An author push after approval dismisses the review AND disables auto-merge. Re-check the new head's scope (`git show --remerge-diff` for merge commits), re-approve, re-approve its runs, and re-arm auto-merge.
- Internal + **one tiny nit** → request-changes / ask them to fix first.
- Anything bigger than a tiny nit → supersede, don't ball-bounce.
- After merge, close leftover duplicate PRs/issues.

## Before you stop (every item)

Run this checklist at the end of each PR/item — don't wait to be reminded:

- [ ] Batch clustered first: PRs sharing a fix/subsystem are grouped into ONE
      super-PR, not enumerated as separate salvages.
- [ ] Verdict is one of: approve / supersede / close-as-wrong-premise (no
      "keep open — ask author" for reshape work).
- [ ] If supersede: Next section has a concrete salvage plan (helpers, drops,
      tests, credit for every author) — ready for "go".
- [ ] Superseded/sibling PRs for this fix are closed with a pointer comment.
- [ ] Related issues this actually fixed are closed (or `Closes #` on the new PR).
- [ ] Any user-facing reply is short and actionable — an optional note, not an essay.
- [ ] Shipping work is split into topical commits (`pr-update`) and CI is green.
- [ ] You scoped the whole fix, not a timid subset.

## Merged-reference issue closure audits

When the user requests recommendations only, preserve that boundary: do not perform forge writes.

- Enumerate the exact eligible issue set programmatically and save it before reviewing; validate the final unique reviewed IDs against that selection so large batches cannot silently lose entries.
- Read the complete issue, comments, reopen events, and merged PR bodies before deciding. Split compound requests into acceptance requirements; a related or explicitly partial PR is not a closure proof.
- Verify every cited merge is an ancestor of the reviewed main SHA. A merged cross-reference from another repository is not evidence of an upstream landing.
- Trace the current implementation and exercise focused behavioral tests. Distinguish a causal fix from a merely adjacent merged reference, and cite the actual fixing commit when needed.
- Keep a report open when post-merge reproductions or unverified required variants remain. Flag reopens explicitly; closure drafts must state the resolved behavior and say main, not released, unless release availability was separately verified.

## Reviewing issues with merged references

- Treat a merged reference as a discovery lead, not completion evidence. Read the full issue and later comments, compare every acceptance requirement with the merged diff and current default-branch code, and preserve explicitly reopened or partially fixed reports.
- Verify repository identity and merge ancestry before claiming implementation on main. A fork or sibling-product merge does not establish upstream coverage; an unavailable commit object is not proof that a commit is or is not an ancestor.
- Persist the selected issue IDs before a batch review, then compare the sorted reviewed IDs against a fresh selection in code. Report exact count equality and retain blocked tests separately from passing checks.

## Auditing issues with merged references

- Honor an issue audit's explicit verdict set (for example, close versus keep-open) instead of applying the external-PR salvage taxonomy. Do not perform forge writes in a read-only audit.
- Select and deduplicate references by full repository-qualified URL, not PR number: a merged fork-only synchronization PR is not an upstream fix. Check each merge SHA against the exact reviewed main SHA.
- Read the full PR diff with `gh pr diff`, not only `git show <mergeCommit>`: after a rebase merge, GitHub's mergeCommit may identify only the last attribution or cleanup commit. For oversized diffs, inspect issue-relevant files/commits and state the limitation.
- Compare every original requirement and later reporter contradiction against current code. Partial fixes, reverted changes, broad trackers, and a successful candidate test are not whole-issue closure proof.
- Trace additional fixes from current source history when a timeline reference is irrelevant; record the newly discovered PR, its ancestry, and behavioral evidence rather than crediting the wrong reference.
- Execute dependency-light behavior probes when the ordinary runner is blocked, without changing shared dependencies. Report runner blockers separately from actual passing probes; never label a blocked suite as passed.
- Persist per-item reviews in batches and verify selected IDs equal reviewed IDs before reporting totals. Closure drafts must cite full fix/source URLs and distinguish main coverage from release availability.

## Hard rules

- Worktrees only for review work — not the primary checkout.
- Never `git stash` in a review worktree. The stash list is shared by every worktree of the repo, so a concurrent agent can pop your entry or you can pop theirs. To revert a file for a before/after test, save it with `git diff <file> > $TMPDIR/x.patch`, run `git checkout -- <file>`, then `git apply` the patch.
- No supersede / close / approve / merge without explicit go.
- No approve past unaddressed lead-maintainer comments.
- No orphaned superseded PRs or fixed issues after a sweep.
- No "ask the author to rewrite" when supersede criteria match — salvage it.
