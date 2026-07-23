---
name: pr-update
description: >-
  Open a PR/MR if missing, or refresh an existing one's title and description
  so they match the current diff. Preserves any media already in the body.
  Use when the user says /pr-update, open a PR, update the PR, refresh the PR
  title/description, or wants the PR opener/manager flow.
---

# PR Update (open or refresh)

One skill for **create** and **update**. Make the title + body match the branch
as it is now. Do not strip media from an existing description.

## Steps

1. `git status` / `git diff` / `git log` / `git diff <default>...HEAD` (and
   remote tracking) so you know the full change set — not just the latest
   commit.
2. Detect an existing PR/MR for this branch (`gh pr view` / `glab mr view`).
   - **None** → create (push upstream with `-u` if needed).
   - **Exists** → edit title + body in place. Do not open a duplicate.
3. Draft a title and body from **all** commits/files in the PR, not one commit.
4. If updating: fetch the current body **first**. Preserve every media item
   exactly (see below). Then rewrite text so Summary / Test plan (or the
   repo's usual sections) stay accurate.
5. Apply with `gh pr create` / `gh pr edit` (or `glab` equivalents).
6. End with the PR/MR as a markdown link (number + full URL). Always.

## Linking (hard rule)

- Every PR/MR number you mention → markdown link with the full forge URL
  (`[#123](https://github.com/org/repo/pull/123)` / GitLab `!` equivalent).
  Never bare `#123` / `PR 123` / `MR !123`.
- After create or update, the final message must include that link. No "done"
  without it.

## Title + body

- Title: concise, why-focused; match repo PR style when obvious.
- Body: use the repo's template when one exists; otherwise:

```markdown
## Summary
<1-3 bullets of what changed and why>

## Test plan
- [ ] <concrete checks>
```

- Run the prose through `no-tropes` before publishing.
- Do not invent reviewers, labels, or milestone unless asked.

## Commits

Shape the branch's commits as part of opening/refreshing the PR.

- One concern per commit. Default to a topical split (2–5 is typical) even if
  not asked; don't dump everything into one blob unless the user wants it.
- Match the repo's recent commit style (`git log --oneline -15`); subject = why.
  No "WIP" / "fix stuff".
- Rebuild with soft reset + path-staged commits (no `git rebase -i` — needs a
  TTY). Show the final `git log --oneline <default>..HEAD` before force-push.
- Keep authorship when reshaping others' work (`Co-authored-by` / cherry-pick),
  especially during `pr-triage` salvage.
- Don't mix pure formatting with logic, commit secrets/`.env`, or rewrite
  commits already on the default branch without asking.

## Preserve media (hard rule)

When a PR/MR already has a body, **never delete media**.

Treat as media (keep verbatim, same URLs/markup/order when possible):

- Markdown images / links to images or video (`![](...)`, `[...](...)` to
  media)
- HTML `<img>`, `<video>`, `<source>`, `<br>` used between media blocks
- GitHub/GitLab upload / user-attachments / moved-image URLs
- Image/video-only paragraphs or HTML comments wrapping media

Update flow:

1. Read the existing body.
2. Extract and keep the media blocks.
3. Rewrite textual sections so they match the current diff.
4. Re-attach the preserved media (same block(s), typically at the end unless
   they were interleaved on purpose — then keep interleaving).
5. Before submit, diff old body vs new: every media URL/markup from the old
   body must still be present.

If a refresh would drop media, stop and keep the old body (or only edit the
title) rather than publishing a media-stripped description.

## Scope

- **In:** open PR/MR, push if needed for create, shape commits, retitle, rewrite
  description, preserve media, print URL.
- **Out:** rebase/CI (`pr-green`), review threads (`pr-bot-reviews`),
  triage/salvage (`pr-triage`), merging.

## Forge cheatsheet

```bash
# GitHub — read
gh pr view --json url,title,body,baseRefName,headRefName

# GitHub — create
gh pr create --title "…" --body "$(cat <<'EOF'
…
EOF
)"

# GitHub — update (body from file avoids shell-eating newlines/media)
gh pr view --json body -q .body > /tmp/pr-body.md
# …edit /tmp/pr-body.md carefully…
gh pr edit --title "…" --body-file /tmp/pr-body.md

# GitLab
glab mr view
glab mr create
glab mr update <N> --title "…" --description-file /tmp/pr-body.md
```
