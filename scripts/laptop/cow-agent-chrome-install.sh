#!/bin/bash
# Install Google's Chrome for Testing as the MacBook's agent browser, beside Callum's own Chrome.
# It is a different app (com.google.chrome.for.testing), so macOS never sends his Dock clicks or
# links to the agent browser, which it did while both ran from Google Chrome.app (2026-11-18).
# Usage: cow-agent-chrome-install.sh [version]   (default: the current Stable version)
# Chrome for Testing does not update itself: re-run this to move the agent browser to a new Stable.
set -euo pipefail
source "$(dirname "$0")/cow-env.sh"
VERSION="${1:-}"
if [ -z "$VERSION" ]; then
  VERSION="$(curl -fsS https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json |
    python3 -I -c 'import json, sys; print(json.load(sys.stdin)["channels"]["Stable"]["version"])')"
fi
DEST="$COW_AGENT_CHROME_ROOT/$VERSION"
APP="$DEST/chrome-mac-arm64/Google Chrome for Testing.app"
if [ -d "$APP" ]; then
  echo "already installed: $APP"
  exit 0
fi
URL="https://storage.googleapis.com/chrome-for-testing-public/$VERSION/mac-arm64/chrome-mac-arm64.zip"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
curl -fSL --retry 2 -o "$TMP/chrome-mac-arm64.zip" "$URL"
mkdir -p "$TMP/x"
ditto -x -k "$TMP/chrome-mac-arm64.zip" "$TMP/x"
NEW="$TMP/x/chrome-mac-arm64/Google Chrome for Testing.app"
# These builds carry only an ad-hoc linker signature (not Google's developer ID), so
# `codesign --verify --deep` always fails on them. Trust rests on HTTPS from Google's bucket; check
# the download is the version asked for and an arm64 executable.
GOT="$(plutil -extract CFBundleShortVersionString raw "$NEW/Contents/Info.plist")"
[ "$GOT" = "$VERSION" ] || { echo "downloaded $GOT, expected $VERSION" >&2; exit 1; }
file "$NEW/Contents/MacOS/Google Chrome for Testing" | grep -q 'arm64' ||
  { echo "not an arm64 executable" >&2; exit 1; }
mkdir -p "$DEST"
mv "$TMP/x/chrome-mac-arm64" "$DEST/"
echo "installed: $APP"
