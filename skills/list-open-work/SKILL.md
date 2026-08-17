---
name: list-open-work
description: >-
  List my open MRs/PRs in the current repo/worktree, each with its tracker
  ticket. Use when I invoke /list-open-work, or ask what I have open, what's
  in review, or for a standup list of my open MRs or PRs.
---

# /list-open-work

Answer one question: what of mine is open **in this repo**, and which ticket
does each carry? Lead with the list. Anything else goes after it, in prose.

## This repo only

Scope is the git checkout you are in (worktree or primary). Read its `origin`.
List **my** open MRs/PRs against **that** remote. Stop there.

- Not a git repo → say so and stop. Do not hunt another project.
- Do not list another origin, org, forge, or tracker from memory, another
  session, or another worktree.
- Infer the ticket key from **this** repo's branches/titles (e.g. `PROJ-123`
  in `feat/PROJ-123-slug`). Never reuse a prefix you saw somewhere else.

```bash
git rev-parse --show-toplevel
git remote get-url origin
```

## Output format

Write it straight into the chat as ordinary rendered markdown. **Never wrap it
in a code fence** — the links have to be clickable.

**Blank line between every item.** Markdown treats a single newline as a space,
so adjacent lines become one paragraph. That is a failure. Each MR is its own
paragraph: newline, blank line, next line.

Exactly this shape. Header is `Open MRs:` or `Open PRs:`. No bullets, no emoji.
The number and the ticket key are both links. Ticket sits in trailing `[KEY]`.

Open MRs:

[!42](https://gitlab.example.com/acme/widgets/-/merge_requests/42) - shorten the save path [[PROJ-101](https://jira.example.com/browse/PROJ-101)]

[!41](https://gitlab.example.com/acme/widgets/-/merge_requests/41) - default the new flag on [[PROJ-99](https://jira.example.com/browse/PROJ-99)]

[!30](https://gitlab.example.com/acme/widgets/-/merge_requests/30) - expose status history on the public API

- Descending by number. `!N` on GitLab, `#N` on GitHub. "MRs" vs "PRs" likewise.
- One paragraph each: `<!|#><N> - <title> [<KEY>]`. No bold.
- Ticket in trailing `[KEY]`. Move it there if the author buried it mid-title:
  `perf: PROJ-77 — cut over-fetch` becomes `perf: cut over-fetch [PROJ-77]`.
- No ticket → omit the `[KEY]`. Don't invent one, don't write `(no ticket)`.
- Keep the MR/PR title as-is (minus the relocated key). Don't rewrite it.

Wrong (renders as one wrapped line):

```
Open MRs:
!42 - shorten the save path [PROJ-101]
!41 - default the new flag on [PROJ-99]
```

Pasting into Slack is a separate ask. Forge/tracker integrations linkify `!42`
and `PROJ-101` on their own, so that version is the same lines with the link
syntax stripped — still one item per line.

## Collect

Mine means authored by me. Resolve my username from the API — never guess it.

GitLab origin:

```bash
glab api user
glab api "projects/<url-encoded-path>/merge_requests?state=opened&scope=all&per_page=100"
```

Filter to author = me. `<url-encoded-path>` is **this** origin's path, not a
path from another repo.

GitHub origin: `gh pr list --author @me --state open --json number,title,headRefName,body`

Ticket = first `\b[A-Z][A-Z0-9]+-\d+\b` in the title, then the branch, then the
description. Use that key's tracker host as this repo uses it — don't guess a
site from another company.

## Then, in prose

Only the things that change what I'd do next:

- Conflicts with the default branch — blocked, not in review. GitLab recomputes
  mergeability lazily, so a plain MR GET happily returns a stale
  `has_conflicts: false`. Force it and read `merge_status`:

```bash
glab api "projects/<path>/merge_requests/<iid>?include_diverged_commits_count=true"
# cannot_be_merged + has_conflicts → needs a rebase; diverged_commits_count = how far behind
```

- Red pipelines (`head_pipeline.status`).
- Ticket status that contradicts the MR: green with every thread resolved but the
  ticket still says In Progress.
- No ticket plus months of age — give the age, offer to close.

Skip approvals unless asked. Don't narrate fields that changed nothing.
