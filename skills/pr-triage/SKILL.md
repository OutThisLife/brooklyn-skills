---
name: pr-triage
description: >-
  Maintainer PR/MR triage: Discord thread intake, approve vs supersede, salvage
  with credit, close superseded PRs/MRs and related issues, treat trusted/internal
  authors differently. Use when starting a review batch, pasting a Discord thread
  with a PR, or asking to salvage/supersede/close a cluster.
---

# PR Triage

For each PR: decide **approve**, **supersede**, or **close** — then do it only
when the user says go. Use `gh` (GitHub) or `glab` (GitLab).

## Kickoff

Batch ("we will be reviewing…") or a pasted Discord/`>>>…<<<` thread with a PR:

1. Figure out repo + forge. Skim `AGENTS.md` / `CONTRIBUTING.md` if present.
2. Match this repo's worktree/branch naming by inspecting existing worktrees.
3. Don't touch the primary checkout — use worktrees.
4. Verdict first; wait for go before approve / supersede / close / merge / push.

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

1. Metadata + diff + existing reviews (`gh` / `glab`).
2. Unaddressed **#1 / lead maintainer** comments → do not approve.
3. Check the premise on current default branch (usually `main`).
4. Cherry-pick/apply in a review worktree; run targeted tests this repo uses.
5. Return a verdict:

```markdown
**PR/MR:** [#N](https://…/pull/N)   ← always a markdown link, never bare #N

**Verdict: approve | supersede | request-changes | close-as-wrong-premise**

**Worktree:** `…` · `<branch>`

### Why
- …

### Checks
| Check | Result |
|---|---|
| Merges onto default branch | … |
| CI | … |
| Targeted tests | … |

### Recommend
… (ask before acting)
```

Every PR/MR number in triage chat or Discord drafts → full markdown link.
Wrap each finished PR with its URL.

## Trusted / internal authors

Infer from organization membership, team roles, prior maintainer behavior, or
the user explicitly identifying someone as a lead/internal contributor.

| Who | Default |
|-----|---------|
| **#1 lead** | Prefer approve/merge. Don't supersede automatically. Never approve over their open review comments. |
| **Other internal** | Prefer approve, or ask them to fix small nits. Supersede only if contaminated / conflicting / wrong-premise / they bounce it. |
| **External** | Normal bar. Supersede when the idea is right but the shape is wrong — keep credit. |

## When to supersede

- Contaminated / wrong close keywords
- Stale conflicts, author not fixing
- Duplicates a helper / wrong layer / wrong issue
- Same bug across 2+ PRs → one shared fix
- Lead feedback ignored and the idea is still right

Not enough alone: taste nits, optional follow-ups, "could be prettier."

## Supersede (only after go)

1. Salvage worktree from default branch.
2. Keep the good idea; drop junk; reuse helpers.
3. Credit: cherry-pick or `Co-authored-by` + `@handle` in the body.
4. Tests for the bug class; green.
5. Open new PR/MR: `Supersedes #N`; `Closes`/`Fixes` only for issues it really fixes.
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
- Internal + tiny nit → ask them to fix first.
- After merge, close leftover duplicate PRs/issues.

## Before you stop (every item)

Run this checklist at the end of each PR/item — don't wait to be reminded:

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
