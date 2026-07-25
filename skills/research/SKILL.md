---
name: research
description: >-
  Look it up before answering or building: the project's own documents of record
  first, then external prior art (GitHub, arXiv, vendor docs, articles). Use when
  the user says research, look it up, sleuth GitHub, "what do other people do",
  "is that a thing", "are you sure", or asks for something that has obviously
  been solved before.
---

# Research

Two halves, in this order: the **documents of record** for this project, then
**prior art** outside it. Answering from memory and calling it research is the
thing this skill is here to stop.

Research gates code. Unless told otherwise, finish the lookup and report the
findings before editing anything (→ `audit-only`).

## Pick a depth and say it

| Depth | For | Shape |
|---|---|---|
| quick | one fact, one API, one flag | a source or two, answer in a paragraph |
| medium | "how do people do this", choosing an approach | 3-6 sources, compare, recommend |
| very thorough | architecture, redesign, "this has to be solved somewhere" | survey the field, name the canon, ROI-ordered options |

Fan out with parallel subagents for breadth. Give each one a scope, a
`Thoroughness:` level, `Do not edit files.`, and a return contract: exact paths
with line numbers and short quotes for code, or URL, technique, license, and
applicability for outside repos.

## Documents of record first

Exhaust what the project already states before searching the web.

- Tickets and specs: Jira/Linear, PRD, MTD, QA feedback docs, the Slack or
  Discord thread that started it.
- `plans/<topic>/*.md`, `AGENTS.md`, `CONTEXT.md`, README, ADRs.
- Figma dev mode when the question is visual. The design is the source of truth
  (→ `figma-implement`).
- The repo itself: `git log -S<symbol>` and `git log -p` for why the code got
  this way, and the vendored source in `node_modules` or site-packages instead
  of a remembered API surface.

When two documents disagree, say so instead of silently picking one. "Double
check against X, Y, Z" means re-read each one and answer per document, not
re-skim your own diff.

## Then prior art

Someone has almost certainly solved this. Go find them and take it.

- GitHub: `gh search repos`, `gh search code`, `gh api`. Read the real source,
  not the README. Note the license before recommending a lift.
- arXiv and papers for anything on agents, generation, simulation, scheduling,
  or scoring.
- Vendor docs and changelogs for API truth. Tutorials, blogs, Reddit, HN, and
  YouTube for what people actually hit in practice.

Report what is reusable, which pattern to copy, and what to leave behind.

## Grade the evidence

Rank the sources and mark which tier a claim sits in:

1. Vendor-documented, or the shipping source code. Strongest.
2. Maintainer statements, papers, primary repos.
3. Blogs, tutorials, forum posts, model memory. Weakest, flag them as such.

Every non-obvious claim carries a URL. With no URL, write "unverified" rather
than stating it flat.

## Don't

- Answer from memory and call it research. "Are you sure?" and "did you
  research?" mean you already got caught doing it.
- Call something impossible or unsupported without opening the docs or source.
- Stop at the first hit when the question was "how do people do this".
- Hand back a link dump. The deliverable is the recommendation, with the
  sources under it.
- Drop the research on the floor. When it drives a change, the PR description
  carries what was found and why (→ `pr-update`).
