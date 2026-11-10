#!/usr/bin/env python3
"""Approves the PRs coworkers ask Callum to stamp in Slack DMs.

Standing authorization (Callum, 2026-11-03, widened 2026-11-10 to any coworker): a 1:1 DM to
Callum containing the word "stamp" and a coval-ai GitHub PR link gets that PR approved as
callumreid. No merges, no comments, no Slack sends.

Each DM message is handled once (exclusive cursor plus a seen list); a PR is skipped when
Callum's own latest review already approves its current head. Scope guards: coval-ai repos
only, senders from Callum's Slack team only (no Slack Connect, no bots), no drafts, closed
PRs or Callum's own PRs, and robyoungsf PRs only in coval-ai/frontend (others are logged for
Callum to look at by hand). A failed approval is retried on the next few runs.

The last stdout line is the run summary shown in CowCode's Scheduled view.
"""

import fcntl
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime

HOME = os.path.expanduser("~")
STATE_DIR = os.path.join(HOME, ".coval", "stamp-check")
STATE_FILE = os.path.join(STATE_DIR, "state.json")
LOG_FILE = os.path.join(HOME, ".coval", "logs", "stamp-check.log")
FIRST_RUN_LOOKBACK = 12 * 3600
SEEN_TTL = 7 * 86400
MAX_ATTEMPTS = 4
ORG = "coval-ai"
ROB = "robyoungsf"

STAMP_RE = re.compile(r"\bstamp", re.IGNORECASE)
PR_URL_RE = re.compile(
    r"https?://github\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)/pull/(\d+)"
)


def log(msg):
    ts = datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %Z")
    line = f"{ts} {msg}"
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")
    print(line, flush=True)


def slack(token, method, params=None):
    url = "https://slack.com/api/" + method
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Authorization": "Bearer " + token})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            # Rate limited (e.g. "Run now" right after a scheduled run): wait as told, then retry.
            if e.code != 429 or attempt == 3:
                raise
            time.sleep(min(int(e.headers.get("Retry-After") or 5), 30))


def gh(args, timeout=60):
    out = subprocess.run(["gh", *args], capture_output=True, text=True, timeout=timeout)
    return out.returncode == 0, out.stdout, out.stderr.strip()


# ---- pure decisions (unit tested) ----


def stamp_links(msg, me, team):
    """The coval-ai PRs a DM message asks Callum to stamp, as [(repo, number)]."""
    if msg.get("user") in (None, me) or msg.get("bot_id") or msg.get("subtype"):
        return []
    sender_team = msg.get("user_team") or msg.get("team")
    if sender_team and team and sender_team != team:
        return []
    text = msg.get("text") or ""
    if not STAMP_RE.search(text):
        return []
    found = []
    for owner, repo, number in PR_URL_RE.findall(text):
        if owner.lower() != ORG:
            continue
        key = (f"{ORG}/{repo}", int(number))
        if key not in found:
            found.append(key)
    return found


def approved_at_head(reviews, login, head):
    """True when `login`'s latest approving/blocking review approves commit `head`."""
    mine = [
        r
        for r in reviews
        if (r.get("login") or "").lower() == login.lower()
        and r.get("state") in ("APPROVED", "CHANGES_REQUESTED", "DISMISSED")
    ]
    return (
        bool(mine)
        and mine[-1]["state"] == "APPROVED"
        and mine[-1].get("commit_id") == head
    )


def skip_reason(repo, pr, login):
    """Why a PR must not be approved, or None."""
    if pr.get("state") != "open":
        return "merged" if pr.get("merged_at") else "closed"
    if pr.get("draft"):
        return "draft"
    author = ((pr.get("user") or {}).get("login") or "").lower()
    if author == login.lower():
        return "Callum's own PR"
    if author == ROB and repo != f"{ORG}/frontend":
        return "robyoungsf outside frontend: Callum to look at by hand"
    return None


def load_state(path=STATE_FILE):
    try:
        with open(path) as f:
            raw = json.load(f)
    except (OSError, ValueError):
        raw = {}
    if "cursors" not in raw:  # the 2026-11-03 hand-installed job stored {channel: ts}
        raw = {"cursors": {k: v for k, v in raw.items() if isinstance(v, (int, float))}}
    raw.setdefault("seen", {})
    raw.setdefault("retry", [])
    return raw


def prune_seen(seen, now):
    return {k: v for k, v in seen.items() if now - v < SEEN_TTL}


# ---- side effects ----


def list_ims(token):
    ims, cursor = [], None
    while True:
        params = {"types": "im", "limit": 200, "exclude_archived": "true"}
        if cursor:
            params["cursor"] = cursor
        page = slack(token, "conversations.list", params)
        if not page.get("ok"):
            raise RuntimeError(f"conversations.list failed: {page.get('error')}")
        ims += page.get("channels", [])
        cursor = (page.get("response_metadata") or {}).get("next_cursor")
        if not cursor:
            return ims


def sender_name(token, user, cache):
    if user not in cache:
        try:
            info = slack(token, "users.info", {"user": user})
            profile = (info.get("user") or {}).get("profile") or {}
            cache[user] = (
                profile.get("real_name") or (info.get("user") or {}).get("name") or user
            )
        except Exception:
            cache[user] = user
    return cache[user]


def handle(repo, number, login):
    """Approve one PR. Returns ("approved"|"already"|"skipped"|"failed", detail)."""
    ok, out, err = gh(["api", f"repos/{repo}/pulls/{number}"])
    if not ok:
        return "failed", f"read PR: {err[:160]}"
    pr = json.loads(out)
    reason = skip_reason(repo, pr, login)
    if reason:
        return "skipped", reason
    head = pr["head"]["sha"]
    ok, out, err = gh(
        [
            "api",
            "--paginate",
            f"repos/{repo}/pulls/{number}/reviews",
            "--jq",
            ".[] | {login: .user.login, state, commit_id}",
        ]
    )
    if not ok:
        return "failed", f"read reviews: {err[:160]}"
    reviews = [json.loads(line) for line in out.splitlines() if line.strip()]
    if approved_at_head(reviews, login, head):
        return "already", f"already approved at {head[:7]}"
    ok, _, err = gh(
        [
            "api",
            "-X",
            "POST",
            f"repos/{repo}/pulls/{number}/reviews",
            "-f",
            "event=APPROVE",
            "-f",
            f"commit_id={head}",
        ]
    )
    if not ok:
        return "failed", f"approve: {err[:160]}"
    return "approved", f"at {head[:7]}"


def main():
    os.makedirs(STATE_DIR, exist_ok=True)
    lock = open(os.path.join(STATE_DIR, "lock"), "w")
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print("previous run still active; skipping")
        status_file = os.environ.get("COW_ROUTINE_STATUS_FILE")
        if status_file:
            open(status_file, "w").write("skipped")
        return 0

    try:
        token = open(os.path.join(HOME, ".slack_token")).read().strip()
    except OSError as e:
        log(f"FAILED: no Slack token ({e.strerror})")
        return 1
    auth = slack(token, "auth.test")
    if not auth.get("ok"):
        log(f"FAILED: Slack auth.test: {auth.get('error')}")
        return 1
    me, team = auth["user_id"], auth.get("team_id")
    ok, out, err = gh(["api", "user", "--jq", ".login"])
    if not ok:
        log(f"FAILED: gh auth: {err[:160]}")
        return 1
    login = out.strip()

    now = time.time()
    state = load_state()
    cursors, seen = state["cursors"], prune_seen(state["seen"], now)
    names = {}
    # (repo, number, sender, attempts)
    work = [
        (r["repo"], r["number"], r.get("sender", "?"), r.get("attempts", 0))
        for r in state["retry"]
    ]

    for ch in list_ims(token):
        cid = ch["id"]
        oldest = cursors.get(cid, now - FIRST_RUN_LOOKBACK)
        try:
            hist = slack(
                token,
                "conversations.history",
                {"channel": cid, "oldest": oldest, "limit": 200, "inclusive": "false"},
            )
        except (OSError, ValueError) as e:  # cursor stays put, so the next run reads it
            hist = {"ok": False, "error": str(e)[:120]}
        if not hist.get("ok"):
            log(f"history for {cid} failed: {hist.get('error')}")
            continue
        msgs = hist.get("messages", [])
        if not msgs:
            continue
        cursors[cid] = max(float(m["ts"]) for m in msgs)
        for m in sorted(msgs, key=lambda m: float(m["ts"])):
            key = f"{cid}:{m['ts']}"
            if key in seen:
                continue
            seen[key] = float(m["ts"])
            for repo, number in stamp_links(m, me, team):
                work.append((repo, number, sender_name(token, m["user"], names), 0))

    approved, skipped, retry, failed, done = [], [], [], [], set()
    for repo, number, sender, attempts in work:
        ref = f"{repo}#{number}"
        if ref in done:
            continue
        done.add(ref)
        outcome, detail = handle(repo, number, login)
        if outcome == "approved":
            approved.append(f"{ref} (from {sender})")
            log(f"APPROVED {ref} {detail} (stamp from {sender})")
        elif outcome == "already":
            log(f"OK {ref}: {detail} (stamp from {sender})")
        elif outcome == "skipped":
            skipped.append(f"{ref} ({detail})")
            log(f"SKIP {ref}: {detail} (stamp from {sender})")
        elif attempts + 1 < MAX_ATTEMPTS:
            retry.append(
                {
                    "repo": repo,
                    "number": number,
                    "sender": sender,
                    "attempts": attempts + 1,
                }
            )
            log(
                f"RETRY {ref}: {detail} (attempt {attempts + 1}/{MAX_ATTEMPTS}, stamp from {sender})"
            )
        else:
            failed.append(ref)
            log(
                f"FAIL {ref}: {detail} (gave up after {MAX_ATTEMPTS} attempts, stamp from {sender})"
            )

    with open(STATE_FILE + ".tmp", "w") as f:
        json.dump({"cursors": cursors, "seen": seen, "retry": retry}, f)
    os.replace(STATE_FILE + ".tmp", STATE_FILE)

    parts = []
    if approved:
        parts.append("approved " + ", ".join(approved))
    if skipped:
        parts.append("skipped " + ", ".join(skipped))
    if retry:
        parts.append(f"retrying {len(retry)}")
    if failed:
        parts.append("FAILED " + ", ".join(failed))
    print("; ".join(parts) if parts else "no new stamp requests", flush=True)
    return 1 if failed else 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (
        Exception
    ) as e:  # one readable FAILED line for the Scheduled view, not a traceback
        log(f"FAILED: {type(e).__name__}: {str(e)[:200]}")
        sys.exit(1)
