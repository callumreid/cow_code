#!/usr/bin/env python3
"""Independent direct-review lane using authoritative GitHub lists, not search."""
import argparse
import concurrent.futures
import fcntl
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time

HOME = Path.home()
ORG = "coval-ai"
ME = "callumreid"
MODEL = "cloudflare-workers-ai/@cf/zai-org/glm-5.3"
STATE = HOME / ".coval/pr-review-requests"


def api(endpoint):
    result = subprocess.run(["gh", "api", "--paginate", endpoint], check=True,
                            capture_output=True, text=True, timeout=120)
    # gh concatenates paginated arrays. Decode every page, including empty pages.
    decoder = json.JSONDecoder()
    rest = result.stdout.strip()
    rows = []
    while rest:
        page, end = decoder.raw_decode(rest)
        if not isinstance(page, list):
            raise ValueError(f"Expected a list from {endpoint}")
        rows.extend(page)
        rest = rest[end:].strip()
    return rows


def eligible(pr):
    author = pr["user"]["login"]
    return (pr["state"] == "open" and not pr["draft"] and author != ME
            and not (author == "robyoungsf" and pr["base"]["repo"]["name"] != "frontend")
            and any(r["login"] == ME for r in pr["requested_reviewers"]))


def discover():
    repos = [r for r in api(f"orgs/{ORG}/repos?type=all&per_page=100")
             if not r["archived"] and not r["disabled"]]

    def pulls(repo):
        return [p for p in api(f"repos/{ORG}/{repo['name']}/pulls?state=open&per_page=100")
                if eligible(p)]

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        # Any failed repository read fails discovery; it never means a clear queue.
        return sorted([p for group in pool.map(pulls, repos) for p in group],
                      key=lambda p: p["created_at"])


def request(pr):
    repo = pr["base"]["repo"]["name"]
    events = api(f"repos/{ORG}/{repo}/issues/{pr['number']}/timeline?per_page=100")
    events = [e for e in events if e.get("event") == "review_requested"
              and e.get("requested_reviewer", {}).get("login") == ME]
    latest = max(events, key=lambda e: (e["created_at"], e["id"]), default=None)
    # A pending request is authoritative even if GitHub omits its timeline event.
    return {"key": f"{repo}#{pr['number']}:{pr['head']['sha']}:{latest['id'] if latest else 'pending'}",
            "at": latest["created_at"] if latest else None}


def served(reviews, head, requested_at, started_at):
    return any(r["user"]["login"] == ME and r["commit_id"] == head
               and r["state"] in ("APPROVED", "CHANGES_REQUESTED", "COMMENTED")
               and r.get("submitted_at", "") > (requested_at or started_at)
               for r in reviews)


def log(status, **fields):
    print(json.dumps({"status": status, **fields}), flush=True)


def review(pr, dry_run):
    repo = pr["base"]["repo"]["name"]
    number = pr["number"]
    head = pr["head"]["sha"]
    token = request(pr)
    if dry_run:
        return {"pr": f"{repo}#{number}", "head": head, "request": token}
    STATE.mkdir(parents=True, exist_ok=True)
    # Per-PR process lock releases on a crash without stale-PID reclamation races.
    with (STATE / f"{repo}-{number}.lock").open("w") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            log("busy", pr=f"{repo}#{number}")
            return True
        # Discovery keeps firing while reviews run. Bound provider work across ticks.
        slot = None
        for index in range(4):
            candidate = (STATE / f"slot-{index}.lock").open("w")
            try:
                fcntl.flock(candidate, fcntl.LOCK_EX | fcntl.LOCK_NB)
                slot = candidate
                break
            except BlockingIOError:
                candidate.close()
        if slot is None:
            log("deferred-capacity", pr=f"{repo}#{number}")
            return True
        try:
            return execute(pr, token)
        finally:
            slot.close()


def execute(pr, token):
    repo = pr["base"]["repo"]["name"]
    number = pr["number"]
    head = pr["head"]["sha"]
    reviews = api(f"repos/{ORG}/{repo}/pulls/{number}/reviews?per_page=100")
    started = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    if token["at"] and served(reviews, head, token["at"], started):
        log("served", pr=f"{repo}#{number}", request=token)
        return True
    current = json.loads(subprocess.run(["gh", "api", f"repos/{ORG}/{repo}/pulls/{number}"],
                         check=True, capture_output=True, text=True, timeout=60).stdout)
    if not eligible(current) or current["head"]["sha"] != head or request(current) != token:
        log("stale", pr=f"{repo}#{number}")
        return True
    title = f"routine: pr-review-requests {repo}#{number} {time.time_ns()}"
    prompt = f"""Review https://github.com/{ORG}/{repo}/pull/{number} at exact head {head}.
Callum explicitly authorized unattended inline reviews and approvals for every direct request,
including each re-request on the SAME head. This pending request is {json.dumps(token)}.
Read repository AGENTS.md, retirements, and /Users/bronson/.agents/skills/review-pr/SKILL.md.
This is the direct-request lane; do not run bulk sweep discovery or dispatch review subagents.
Do a careful read-only review using the actual baseRefName and three-dot diff; cross-check files
against GitHub. Lead a re-review with whether prior findings are addressed. Lean APPROVE;
REQUEST_CHANGES only for a confirmed P0/P1 with a concrete failure scenario. Post findings inline
using /Users/bronson/.agents/skills/review-pr/scripts/post-inline-review.py --dry-run first.
Before POST, read current PR and paginated reviews and request timeline again: require exact head,
open non-draft, direct callumreid request, and unchanged latest request event. If Callum already
submitted a review on this head AFTER this request, stop without posting. An approval BEFORE this
request (by anyone) does NOT satisfy it. Another person's approval does NOT consume Callum's request.
After a posting error read reviews before retrying. Verify the review was posted on the exact head.
Never merge, push, commit fixes, request/re-request reviewers, promote drafts, send Slack, deploy,
run infrastructure applies, or touch databases. Remove only worktrees you created. No daily note
for routine reviews. Print PR_DIRECT_REVIEW_COMPLETE only after verified posting or a verified
stale/consumed request. If unable to finish, report the failure plainly and leave it retryable.
"""
    env = dict(os.environ)
    env["OPENCODE_SERVER_USERNAME"] = os.environ.get("COW_SERVER_USERNAME", "cow")
    env["OPENCODE_SERVER_PASSWORD"] = (HOME / ".config/opencode/server-password").read_text().splitlines()[0]
    report = STATE / f"{repo}-{number}-{time.time_ns()}.log"
    command = [str(HOME / ".opencode/bin/opencode"), "run", "--auto", "--attach",
               "http://127.0.0.1:4096", "--title", title, "-m", MODEL, prompt]
    ok = False
    try:
        with report.open("w") as output:
            subprocess.run(command, env=env, cwd=HOME / "coval", stdout=output,
                           stderr=subprocess.STDOUT, check=True, timeout=1800)
        reviews = api(f"repos/{ORG}/{repo}/pulls/{number}/reviews?per_page=100")
        ok = served(reviews, head, token["at"], started)
    finally:
        # Stop only this unique session, including if the attach client timed out.
        subprocess.run(["/bin/bash", "-c",
                        'source "$HOME/bin/cow-routine-guard.sh"; routine_finish "$1"',
                        "direct-review-cleanup", title], env=env, timeout=60, check=True,
                       stdout=subprocess.DEVNULL)
    log("reviewed" if ok else "failed", pr=f"{repo}#{number}", request=token, report=str(report))
    return ok



def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Discover only; never start sessions or post")
    parser.add_argument("--worker", nargs=2, metavar=("REPO", "NUMBER"), help=argparse.SUPPRESS)
    args = parser.parse_args()
    os.environ["PATH"] = "/opt/homebrew/bin:/usr/local/bin:" + os.environ.get("PATH", "")
    if not shutil.which("gh"):
        raise RuntimeError("gh missing; queue status is UNKNOWN")
    if args.worker:
        repo, number = args.worker
        pr = json.loads(subprocess.run(["gh", "api", f"repos/{ORG}/{repo}/pulls/{int(number)}"],
                        check=True, capture_output=True, text=True, timeout=60).stdout)
        return 0 if not eligible(pr) or review(pr, False) else 1
    candidates = discover()
    log("discovered", count=len(candidates))
    if args.dry_run:
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            print(json.dumps(list(pool.map(lambda pr: review(pr, True), candidates)), indent=2))
        return 0
    STATE.mkdir(parents=True, exist_ok=True)
    # Detached, bounded workers let the next discovery tick see newly arrived requests
    # even while a large review is running. Process locks prevent duplicate dispatch.
    for pr in candidates:
        repo = pr["base"]["repo"]["name"]
        with (STATE / f"{repo}-{pr['number']}-worker.log").open("a") as output:
            subprocess.Popen([sys.executable, __file__, "--worker", repo, str(pr["number"])],
                             stdout=output, stderr=subprocess.STDOUT, start_new_session=True)
        log("dispatched", pr=f"{repo}#{pr['number']}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:
        log("failed", error=str(error))
        sys.exit(1)
