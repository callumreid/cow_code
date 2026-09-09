#!/bin/bash
# The Coval backend dev pipeline on the box, detached in tmux. Usage: cow-pipeline.sh start|stop|status|logs
# Workers only take runs launched with dev_id=callum (backend/.dev_id), so leaving them up is safe.
export HOME=/Users/bronson
export PATH=$HOME/.local/bin:/opt/homebrew/bin:/Applications/Docker.app/Contents/Resources/bin:/usr/bin:/bin:/usr/sbin:/sbin
[ -f "$HOME/.config/cow/secrets.env" ] && source "$HOME/.config/cow/secrets.env"
BACKEND="$HOME/coval/backend"
LOG="$HOME/Library/Logs/cow-pipeline.log"
case "${1:-status}" in
  start)
    cd "$BACKEND" || exit 1
    aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 851725437270.dkr.ecr.us-east-2.amazonaws.com >/dev/null 2>&1 || { echo "ecr login failed"; exit 1; }
    tmux kill-session -t pipeline 2>/dev/null
    tmux new-session -d -s pipeline "export PATH=$PATH; cd $BACKEND && ./run_dev_pipeline.sh 2>&1 | tee -a $LOG"
    echo "pipeline starting in tmux session 'pipeline' (log: $LOG)"
    ;;
  stop)
    cd "$BACKEND" && docker compose down --remove-orphans; tmux kill-session -t pipeline 2>/dev/null; echo "pipeline stopped" ;;
  logs) tail -n "${2:-50}" "$LOG" ;;
  status|*)
    cd "$BACKEND" && docker compose ps --format "table {{.Service}}\t{{.State}}\t{{.Status}}" 2>/dev/null; tmux has-session -t pipeline 2>/dev/null && echo "tmux: pipeline session running" || echo "tmux: no pipeline session" ;;
esac
