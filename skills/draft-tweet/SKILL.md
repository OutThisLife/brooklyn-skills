---
name: draft-tweet
description: >-
  Draft X/Twitter posts about shipped work. Never post unless asked. Use when
  the user wants tweet options or "what should I tweet".
---

# Draft Tweet

Write tweet options. **Do not post** unless they explicitly say to.

## Match their voice

If `xurl` is installed and already authenticated, use it read-only to sample
the user's recent original posts before drafting:

```bash
xurl whoami
xurl posts @handle -n 30
```

If that version does not have `xurl posts`, use the user ID from `xurl whoami`:

```bash
xurl '/2/users/<id>/tweets?max_results=30&exclude=retweets,replies'
```

Infer their usual capitalization, punctuation, sentence length, vocabulary,
link use, and emoji use. Match the patterns, not the subject matter. Do not
quote old posts or mention that style sampling happened.

If `xurl` is missing or unauthenticated, draft from examples already in the
conversation. Do not block the task or ask them to configure X unless they
specifically request stronger style matching.

## Output

2–4 options, each roughly ≤240 chars:

- Concrete claim or user benefit — no empty hype
- Little/no emoji; no engagement bait
- One link max if useful
- Run through `no-tropes`

## Don't

- Call `xurl post`, reply, quote, DM, or any other write API unless asked
- Invent performance numbers they didn't bless
- Default to a thread — offer one only if they want depth
