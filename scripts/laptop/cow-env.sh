# Shared settings for the MacBook's stand-in for barn. Sourced by the cow-*.sh launchers here.
# The local cow server is the CowCode desktop app's own server: port 4096, user "opencode", and the
# app's stable per-install password. Threads it runs show in CowCode on this machine.
export HOME=${HOME:-/Users/bronson}
export PATH=$HOME/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin
export COW_SERVER_URL=http://127.0.0.1:4096
export COW_SERVER_USERNAME=opencode
export COW_SERVER_PASSWORD_FILE="$HOME/Library/Application Support/ai.opencode.desktop.dev/opencode/companion-password"
# The agent browser is Chrome for Testing (cow-agent-chrome-install.sh), not Google Chrome.app, so it
# never takes Callum's Chrome clicks. Its profile is separate from the old Google Chrome one
# (CowCode/browser-profile), whose cookies only Google Chrome can decrypt.
export COW_AGENT_CHROME_ROOT="$HOME/Library/Application Support/CowCode/chrome-for-testing"
export COW_BROWSER_PROFILE="$HOME/Library/Application Support/CowCode/agent-browser-profile"
export COW_BROWSER_OUTPUT_DIR="$HOME/Library/Application Support/CowCode/browser-output"
export COW_BROWSER_SIGNIN_WHERE="in the Browser panel on the job's thread in CowCode on the MacBook (choose Take control), where the Coval sign-in page is open; the agent Chrome has no window of its own"
