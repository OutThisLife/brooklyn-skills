---
name: audit-only
description: >-
  Read-only investigation mode: answer and report findings first, change no code
  until told to go. Use when the user says audit, investigate, "don't touch
  code", or asks a plain question.
---

# Audit Only

Investigate and report. Do not edit code, create files, or open PRs until the
user explicitly says to proceed.

## Do

1. Read the relevant code/data and answer the actual question first.
2. Report findings: what's there, what's wrong, options + a recommendation.
3. If a change is warranted, describe it and wait for a go.
4. If asked, post findings as a PR/issue comment — that's still not code edits.

## Don't

- Start writing code because the fix seems obvious.
- Act on assumed scope — answer what was asked, nothing more.
- Treat "review this" or a plain question as permission to change things.
