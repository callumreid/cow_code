# Shared settings for the MacBook's stand-in for barn. Sourced by the cow-*.sh launchers here.
# The local cow server is the CowCode desktop app's own server: port 4096, user "opencode", and the
# app's stable per-install password. Threads it runs show in CowCode on this machine.
export HOME=${HOME:-/Users/bronson}
export PATH=$HOME/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin
export COW_SERVER_URL=http://127.0.0.1:4096
export COW_SERVER_USERNAME=opencode
export COW_SERVER_PASSWORD_FILE="$HOME/Library/Application Support/ai.opencode.desktop.dev/opencode/companion-password"
export COW_BROWSER_PROFILE="$HOME/Library/Application Support/CowCode/browser-profile"
export COW_BROWSER_OUTPUT_DIR="$HOME/Library/Application Support/CowCode/browser-output"
