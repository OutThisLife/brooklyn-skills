# Brooklyn's skills

Portable `SKILL.md` packages for coding agents. There are no harness-specific
commands, hooks, adapters, or setup scripts.

## Use

Give your agent this repository:

```text
https://github.com/OutThisLife/brooklyn-skills
```

Then ask it to install one skill, a few named skills, or all of them in the
location its harness expects. For example:

```text
Install the pr-triage and pr-bot-reviews skills from this repository.
```

The agent should copy each requested `skills/<name>/` directory as a complete
unit so references and bundled resources remain intact.

## Always-on defaults

`defaults.md` is a small set of baseline behaviors meant to be **always loaded**,
not invoked. It's harness-agnostic: wire it into `~/.cursor/rules/defaults.mdc`
(Cursor, with `alwaysApply: true`) or your `AGENTS.md` (Claude Code, Codex, and
most other agents). The skills handle the deeper workflows it points to.

## Contents

- `skills/` — portable `SKILL.md` packages, invoked on demand
- `defaults.md` — always-on baseline behaviors

No commands, hooks, editor settings, secrets, or machine state are included.

## Related workflows

Personal setup notes (git worktree cleanup, scheduled prune, disk tips) live in
the **[BB Workflows](https://gist.github.com/OutThisLife/69e87de53bb37ff85387cb120632f255)** gist:

| File | Contents |
| --- | --- |
| [main.md](https://gist.github.com/OutThisLife/69e87de53bb37ff85387cb120632f255#file-main-md) | Index |
| [general.md](https://gist.github.com/OutThisLife/69e87de53bb37ff85387cb120632f255#file-general-md) | git-gtr + shared cleanup (cross-platform) |
| [mac.md](https://gist.github.com/OutThisLife/69e87de53bb37ff85387cb120632f255#file-mac-md) | macOS install, zsh helper, LaunchAgent |
| [windows.md](https://gist.github.com/OutThisLife/69e87de53bb37ff85387cb120632f255#file-windows-md) | Windows 11 install, Task Scheduler |

MIT licensed.
