---
name: ticket-ship
description: >-
  Take a tracker ticket through to shipped: find or start the PR, drive it to
  mergeable, update the ticket state, draft the stakeholder message. Use for
  Jira/Linear (or acli) tickets assigned to you.
---

# Ticket → Ship

The ticket-shaped parts of shipping. The PR mechanics live in their own skills —
this is what a tracker adds on top.

## Steps

1. Read the ticket and its latest comments, then list existing PRs before starting (`acli`, Jira, Linear, `gh`). With `acli`, request `--fields summary,description,status,comment,issuelinks --json`: the default view omits comments, which can contain reopened QA scope. Read the existing PR diff as well as its body; follow-up commits can invalidate the body's implementation claims.
2. Confirm the correct base branch(es) before starting — some orgs need a
   release branch plus the default (`stacked-pr`). Never assume; verify the
   org's rule.
3. Find the existing PR or start one (`work` → `pr-update`), then drive it
   mergeable (`pr-ready`) and polish before handoff (`clean`).
4. Read the repository's ticket/label guidance before selecting a handoff state; don't substitute generic workflow names. In MR, use `.claude/skills/create-pr/SKILL.md` and `teams.md` for label rules. For an existing DOTCOMPB PR returned by QA and then fixed, the user's retest handoff is **In Test** with **Pending QA Review**, not a reset to In Code Review. Preserve the ticket-driven Needs UI Review label. Report CI/deployment blockers separately; In Test does not mean merge-ready. Link the PR and add a factual retest update when the user requests the handoff.
5. Draft the stakeholder update — Slack or a ticket comment, short, `no-tropes`.
   Don't send it unless asked.

## Don't

- Assume the base branch.
- Mark the ticket done while CI is red or review threads are open.
- Let the ticket and the PR tell different stories about the state of the work.
