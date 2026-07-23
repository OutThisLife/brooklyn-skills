# PR / MR triage — templates

Use `gh` or `glab` to match the forge. Bodies are the same either way.

## Superseding PR/MR body

```markdown
## Summary

Supersedes #<old> (and consolidates #<sibling> / #<sibling> if applicable).

<1–3 paragraphs: problem, why the old one wasn't mergeable as-is, what this does>

### What this PR does
- …

### What was dropped from #<old>
- …

## Test plan
- [x] <repo's test command> → …
- [ ] manual check if needed

Closes #<issue>   <!-- only if this actually fixes that issue -->

Credit: @author (primary). Related: #…
```

Title pattern: `<type>(area): short description (supersedes #N)`

## Close comment on superseded PR/MR

```markdown
Superseded by #<new>.

That salvage keeps <core idea>, rebased onto current default branch, and:

- <change 1>
- <change 2>
- …

You're credited via `Co-authored-by`. Thanks for <what they got right>.
```

```bash
# GitHub
gh pr close <old> --reason "not planned" --comment "Closing in favor of #<new>."

# GitLab
glab mr note <old> -m "Superseded by !<new>."
glab mr close <old>
```

## Co-authored-by trailer

```
Co-authored-by: Their Name <their@email>
```

From original commits (`git log -1 --format='%an <%ae>'`), not invented.

## Approve (short)

```bash
# GitHub
gh pr review <N> --approve --body "LGTM — <one sentence>."

# GitLab
glab mr approve <N>
glab mr note <N> -m "LGTM — <one sentence>."
```

## Request-changes (trusted-author nit)

Short — ask them to fix, don't take the PR:

```bash
# GitHub
gh pr review <N> --request-changes --body "$(cat <<'EOF'
Almost there — one ask before merge:

- <single concrete nit>

Happy to approve as soon as that's in.
EOF
)"

# GitLab
glab mr note <N> -m "$(cat <<'EOF'
Almost there — one ask before merge:

- <single concrete nit>

Happy to approve as soon as that's in.
EOF
)"
# (unapprove / block merge per project rules if needed)
```

## Wrong-premise close (no salvage)

```markdown
Closing — the premise doesn't hold against how <X> actually works on current default branch.

<2–4 sentences pointing at the real line / invariant>

Happy to revisit if there's a different repro against latest.
```

## Close related issue (not auto-linked)

```bash
# GitHub
gh issue close <N> --comment "Fixed by #<pr>."

# GitLab
glab issue close <N> -m "Fixed by !<mr>."
```

## Sibling duplicate (same fix class)

```markdown
Superseded by #<new> — same fix class, already landed / being landed there.

Closing so we don't double-merge. Thanks for the work here; credit carried on #<new> where applicable.
```
