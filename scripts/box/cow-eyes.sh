#!/bin/bash
# Watch/take-over view for the box's Chrome, kept alive by launchd (dev.bronson.cow-eyes).
export HOME=/Users/bronson
export PATH=$HOME/.local/bin:/opt/homebrew/bin:/usr/bin:/bin
exec "$HOME/.local/bin/cow-eyes"
