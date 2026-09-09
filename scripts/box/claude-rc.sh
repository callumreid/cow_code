#!/bin/bash
# Claude Code Remote Control server on the box, kept alive by launchd (dev.bronson.claude-rc).
# Sessions are created on demand from the Claude app / claude.ai/code and run here in ~/coval.
export HOME=/Users/bronson
export PATH=$HOME/.local/bin:/opt/homebrew/bin:/Applications/Docker.app/Contents/Resources/bin:/usr/bin:/bin:/usr/sbin:/sbin
[ -f "$HOME/.config/cow/secrets.env" ] && source "$HOME/.config/cow/secrets.env"
export CLAUDE_REMOTE_CONTROL_SESSION_NAME_PREFIX=barn
LOG=$HOME/Library/Logs/claude-rc.log
cd "$HOME/coval"
if ! tmux has-session -t claude-rc 2>/dev/null; then
  echo "$(date '+%F %T') starting claude remote-control in tmux" >> "$LOG"
  tmux new-session -d -s claude-rc -x 200 -y 50 "claude remote-control --name barn --spawn same-dir 2>&1 | tee -a $LOG"
  # First start asks "Enable Remote Control? (y/n)"; answer it so the server comes up unattended.
  for _ in $(seq 1 30); do
    sleep 1
    if tmux capture-pane -p -t claude-rc 2>/dev/null | grep -q "(y/n)"; then tmux send-keys -t claude-rc y Enter; break; fi
  done
fi
while tmux has-session -t claude-rc 2>/dev/null; do sleep 30; done
echo "$(date '+%F %T') tmux session ended" >> "$LOG"
