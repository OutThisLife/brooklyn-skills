---
name: pr-triage
description: >-
  Maintainer PR/MR triage: Discord thread intake, approve vs supersede, salvage
  with credit, close superseded PRs/MRs and related issues, treat trusted/internal
  authors differently. Use when starting a review batch, pasting a Discord thread
  with a PR, or asking to salvage/supersede/close a cluster.
---

# PR Triage

Maintainer triage. Three real outcomes: **approve**, **supersede** (salvage +
credit + close the old one), or **close** (wrong premise). Verdict first; wait
for an explicit **go** before forge writes (approve / supersede / close / merge /
push). Use `gh` or `glab`.

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
**PR/MR:** [#N](https://…/pull/N)   ← always a markdown link, never bare #N

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

Every PR/MR number in triage chat or Discord drafts → full markdown link.
Wrap each finished PR with its URL.

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

## Hard rules

- Worktrees only for review work — not the primary checkout.
- No supersede / close / approve / merge without explicit go.
- No approve past unaddressed lead-maintainer comments.
- No orphaned superseded PRs or fixed issues after a sweep.
- No "ask the author to rewrite" when supersede criteria match — salvage it.
