"""Verify pr-keep-updated.sh inactivity gating, merge-ready/queue skipping, and update caps."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).with_name("pr-keep-updated.sh")
PLIST = Path(__file__).parent / "launchd/dev.coval.pr-keep-updated.plist"

FAKE_GH = '''#!/usr/bin/env python3
import json, os, pathlib, sys

state_dir = pathlib.Path(os.environ["FAKE_GH_DIR"])
data = json.loads((state_dir / "fixture.json").read_text())
args = sys.argv[1:]

if args[:2] == ["search", "prs"]:
    for item in data.get("prs", []):
        print(f"{item['repo']} {item['number']}")
    sys.exit(0)

if args[:2] == ["repo", "view"]:
    repo = args[2].split("/")[-1]
    archived = data.get("archived", {}).get(repo, False)
    print("true" if archived else "false")
    sys.exit(0)

if args[:2] == ["api", "graphql"]:
    repo = ""
    number = 0
    for i, a in enumerate(args):
        if a.startswith("name="):
            repo = a.split("=", 1)[1]
        elif a.startswith("number="):
            number = int(a.split("=", 1)[1])
    key = f"{repo}#{number}"
    pr = data.get("details", {}).get(key)
    if pr is None:
        sys.exit(1)
    print(json.dumps({"data": {"repository": {"pullRequest": pr}}}))
    sys.exit(0)

if args[:1] == ["api"] and len(args) >= 2 and "/compare/" in args[1]:
    parts = args[1].split("/")
    repo = parts[2]
    head = parts[4].split("...")[-1]
    behind = data.get("behind", {}).get(f"{repo}:{head}", 0)
    print(behind)
    sys.exit(0)

if args[:3] == ["api", "-X", "PUT"] and len(args) >= 4 and args[3].endswith("/update-branch"):
    parts = args[3].split("/")
    repo = parts[2]
    number = parts[4]
    key = f"{repo}#{number}"
    updates_file = state_dir / "updates.json"
    updates = json.loads(updates_file.read_text()) if updates_file.exists() else []
    updates.append(key)
    updates_file.write_text(json.dumps(updates))
    outcome = data.get("update_outcomes", {}).get(key, {"rc": 0, "out": '{"message":"Updating pull request branch."}'})
    print(outcome.get("out", ""))
    sys.exit(outcome.get("rc", 0))

sys.exit(1)
'''


def make_pr(**overrides):
    pr = {
        "state": "OPEN",
        "isDraft": False,
        "updatedAt": "2026-11-02T10:00:00Z",
        "mergeable": "MERGEABLE",
        "mergeStateStatus": "BLOCKED",
        "reviewDecision": "REVIEW_REQUIRED",
        "baseRefName": "main",
        "headRefOid": "head1",
        "isInMergeQueue": False,
        "autoMergeRequest": None,
        "mergeQueueEntry": None,
        "labels": {"nodes": []},
        "reviewThreads": {"nodes": []},
        "commits": {
            "nodes": [
                {
                    "commit": {
                        "committedDate": "2026-11-02T10:00:00Z",
                        "statusCheckRollup": {"state": "SUCCESS"},
                    }
                }
            ]
        },
    }
    pr.update(overrides)
    return pr


class PrKeepUpdatedTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="cow-keep-updated-")
        self.root = Path(self.temp.name)
        self.bin_dir = self.root / "bin"
        self.bin_dir.mkdir(parents=True)
        gh = self.bin_dir / "gh"
        gh.write_text(FAKE_GH)
        gh.chmod(0o755)
        notify = self.bin_dir / "cow-notify.sh"
        notify.write_text("#!/bin/bash\nprintf '%s\\n' \"$*\" >> \"$FAKE_GH_DIR/notified.txt\"\n")
        notify.chmod(0o755)
        self.log_dir = self.root / "logs"

    def tearDown(self):
        self.temp.cleanup()

    def run_keep_updated(self, fixture, now="2026-11-02T18:00:00Z", extra_env=None, args=None):
        (self.root / "fixture.json").write_text(json.dumps(fixture))
        env = {
            **os.environ,
            "FAKE_GH_DIR": str(self.root),
            "COW_KEEP_UPDATED_HOME": str(self.root),
            "COW_KEEP_UPDATED_LOG_DIR": str(self.log_dir),
            "COW_KEEP_UPDATED_PATH": f"{self.bin_dir}:/usr/bin:/bin",
            "PR_KEEP_UPDATED_NOW": now,
        }
        if extra_env:
            env.update(extra_env)
        cmd = ["/bin/bash", str(SCRIPT)] + (args or [])
        res = subprocess.run(cmd, env=env, capture_output=True, text=True, timeout=10)
        log = (self.log_dir / "pr-keep-updated.log").read_text() if (self.log_dir / "pr-keep-updated.log").exists() else ""
        updates = json.loads((self.root / "updates.json").read_text()) if (self.root / "updates.json").exists() else []
        return res, log, updates

    def test_plist_runs_hourly_at_15(self):
        res = subprocess.run(["plutil", "-convert", "json", "-o", "-", str(PLIST)], capture_output=True, text=True, check=True)
        plist = json.loads(res.stdout)
        self.assertEqual(plist["StartCalendarInterval"], [{"Minute": 15}])

    def test_skips_recently_active_prs_under_4h_and_updates_stale_ones(self):
        fixture = {
            "prs": [
                {"repo": "frontend", "number": 101},
                {"repo": "backend", "number": 202},
            ],
            "details": {
                # Active 30 minutes ago -> should be skipped as active
                "frontend#101": make_pr(headRefOid="h101", updatedAt="2026-11-02T17:30:00Z"),
                # Inactive for 8 hours -> should be updated
                "backend#202": make_pr(headRefOid="h202", updatedAt="2026-11-02T10:00:00Z"),
            },
            "behind": {
                "frontend:h101": 3,
                "backend:h202": 2,
            },
        }
        res, log, updates = self.run_keep_updated(fixture)
        self.assertEqual(res.returncode, 0)
        self.assertEqual(updates, ["backend#202"])
        self.assertIn("skipping frontend#101 (3 behind main) - active 30m ago (<240m)", log)
        self.assertIn("updated backend#202 (2 commits behind main)", log)
        self.assertIn("done — updated 1, current 0, active 1, ready 0, skipped 0, conflicts 0, deferred 0, unknown 0, errors 0", log)

    def test_skips_merge_queue_armed_automerge_and_green_approved_prs(self):
        fixture = {
            "prs": [
                {"repo": "backend", "number": 1},
                {"repo": "backend", "number": 2},
                {"repo": "frontend", "number": 3},
                {"repo": "frontend", "number": 4},
            ],
            "details": {
                "backend#1": make_pr(headRefOid="h1", isInMergeQueue=True),
                "backend#2": make_pr(headRefOid="h2", autoMergeRequest={"enabledAt": "2026-11-02T12:00:00Z"}),
                "frontend#3": make_pr(headRefOid="h3", reviewDecision="APPROVED", mergeStateStatus="CLEAN"),
                # Approved + CLEAN, but has an unresolved review thread -> NOT ready, and stale -> updated
                "frontend#4": make_pr(
                    headRefOid="h4",
                    reviewDecision="APPROVED",
                    mergeStateStatus="CLEAN",
                    reviewThreads={"nodes": [{"isResolved": False}]},
                ),
            },
            "behind": {
                "backend:h1": 2,
                "backend:h2": 4,
                "frontend:h3": 1,
                "frontend:h4": 5,
            },
        }
        res, log, updates = self.run_keep_updated(fixture)
        self.assertEqual(res.returncode, 0)
        self.assertEqual(updates, ["frontend#4"])
        self.assertIn("skipping backend#1 (2 behind main) - in merge queue", log)
        self.assertIn("skipping backend#2 (4 behind main) - auto-merge armed", log)
        self.assertIn("skipping frontend#3 (1 behind main) - green and approved", log)
        self.assertIn("done — updated 1, current 0, active 0, ready 3, skipped 0, conflicts 0, deferred 0, unknown 0, errors 0", log)

    def test_merge_queue_rejection_during_put_counts_as_ready_not_error(self):
        fixture = {
            "prs": [{"repo": "backend", "number": 8833}],
            "details": {"backend#8833": make_pr(headRefOid="h8833")},
            "behind": {"backend:h8833": 2},
            "update_outcomes": {
                "backend#8833": {
                    "rc": 1,
                    "out": '{"message":"protected branch check failed: A pull request for this branch has been added to a merge queue."}',
                }
            },
        }
        res, log, updates = self.run_keep_updated(fixture)
        self.assertEqual(res.returncode, 0)
        self.assertEqual(updates, ["backend#8833"])
        self.assertIn("skipping backend#8833 (2 behind main) - in merge queue", log)
        self.assertIn("ready 1", log)
        self.assertIn("errors 0", log)


if __name__ == "__main__":
    unittest.main()
