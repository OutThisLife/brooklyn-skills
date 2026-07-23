---
name: ticket-ship
description: >-
  Take a tracker ticket through to shipped: find/make the PR, pass reviews and
  CI, update the ticket, draft the stakeholder message. Use for Jira/Linear (or
  acli) tickets assigned to you.
---

# Ticket → Ship

Drive an assigned ticket end to end.

## Steps

1. Read the ticket and list the assigned work (`acli`, Jira, Linear, etc.).
2. Find an existing PR for it or start one (`work`); confirm the correct base
   branch(es) — some orgs need release + default (`stacked-pr`).
3. Bring it green: `pr-green` for rebase/CI, `pr-bot-reviews` for comments.
4. `clean` before handoff; topical commits (`pr-update`).
5. Move the ticket to the right state (e.g. In Review / Test).
6. Draft the stakeholder update (Slack/Jira comment) — short, `no-tropes`. Don't
   send unless asked.
7. End with the PR/MR as a markdown link (`[#N](full-url)`). Always.

## Don't

- Assume the base branch — verify the org's rule.
- Mark the ticket done while CI is red or review threads are open.
- Mention a PR/MR number without linking it.
