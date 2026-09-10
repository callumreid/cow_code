# This machine is the cow box (Callum's always-on Mac mini)

Threads and scheduled jobs run here 24/7 on Callum's behalf. Same rules as his laptop, with
three differences:

- **The Obsidian vault is read-only here.** Read `~/personal/Bronniopollis` for context if useful,
  but never write daily minutes, agent memory, or notes from this machine; the laptop is the only
  vault writer and publisher. Put findings in your run output, the PR, or the Slack thread instead.
- **Never pass a git identity to git** (`-c user.email`, `--author`, `GIT_AUTHOR_EMAIL`,
  `git config user.email`). The global identity is already `Callum Reid <callum@coval.dev>` and a
  hook rejects anything else.
- **Shell safety:** when searching for literal command text use single-quoted patterns; never put
  backticks or `$()` inside a double-quoted shell command.

Coval rules live in `/Users/bronson/coval/CLAUDE.md` and `AGENTS.md` (Linear-first for real
implementation work; worktrees cut from fresh `origin/main`; `/v1` API only; DB read-only).
The shared browser and its "computer view" are described in `~/.config/opencode/AGENTS.md`.
