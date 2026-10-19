"""Exercise deployment decisions through fake OS commands, never a live server."""
import json
import os
from pathlib import Path
import sqlite3
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).with_name("cow-deploy-server.sh")
FAKE = r'''#!/usr/bin/env python3
import json, os, pathlib, subprocess, sys
root = pathlib.Path(os.environ["COW_DEPLOY_ROOT"])
scenario = os.environ["COW_DEPLOY_TEST_SCENARIO"]
command = pathlib.Path(sys.argv[0]).name
with (root / "calls").open("a") as log:
    log.write(command + " " + (sys.argv[1] if len(sys.argv) > 1 else "") + "\n")
state = json.loads((root / "state.json").read_text())
if command == "sleep":
    sys.exit(0)
if command == "curl":
    if sys.argv[-1].endswith("/session/status"):
        calls = root / "status-calls"
        count = int(calls.read_text()) + 1 if calls.exists() else 1
        calls.write_text(str(count))
        if scenario == "empty_status": sys.exit(0)
        if scenario == "http_status": sys.exit(22)
        if scenario == "invalid_status": print("[]"); sys.exit(0)
        print(json.dumps({"session": {"type": "busy"}} if (scenario == "busy" or (scenario == "busy_after_snapshot" and count > 1)) else {}))
        sys.exit(0)
    if scenario == "bad_before": print("<html>bad gateway</html>"); sys.exit(0)
    if state["version"] == "new" and scenario == "bad_after": print('{"healthy":false,"version":"new"}'); sys.exit(0)
    version = "wrong" if state["version"] == "new" and scenario == "wrong_version" else state["version"]
    print(json.dumps({"healthy": True, "version": version}))
    sys.exit(0)
if command == "launchctl":
    if sys.argv[1] == "kickstart":
        version = subprocess.check_output([str(root / ".local/bin/opencode"), "--version"], text=True).strip()
        (root / "state.json").write_text(json.dumps({"version": version, "pid": state["pid"] if scenario == "stale_pid" else state["pid"] + 1}))
        sys.exit(0)
    if sys.argv[-1].endswith("cow-server"):
        print("service = {\n pid = " + str(state["pid"]) + "\n}")
        sys.exit(0)
    if scenario == "job_error": print("permission denied", file=sys.stderr); sys.exit(1)
    if scenario == "job_unknown": print("service = {}"); sys.exit(0)
    if scenario == "job_running": print(" state = running"); sys.exit(0)
    print("Could not find service", file=sys.stderr)
    sys.exit(113)
if command == "lsof":
    if scenario == "db_unknown_before" or (state["version"] == "new" and scenario == "db_unknown_after"): sys.exit(1)
    if scenario == "db_ambiguous": print("n" + str(root / "opencode-other.db"))
    filename = "opencode-other.db" if state["version"] == "new" and scenario == "db_changed" else "opencode-feat-cow-ui.db"
    print("p" + str(state["pid"]) + "\nn" + str(root / filename))
    sys.exit(0)
raise RuntimeError("unexpected fake command")
'''


class CowDeployServerTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="cow deploy's test ")
        self.root = Path(self.directory.name)
        for directory in [".local/bin", ".config/opencode", "fake-bin"]:
            (self.root / directory).mkdir(parents=True)
        (self.root / ".config/opencode/server-password").write_text("fixture-secret\n")
        for filename, version in [("opencode", "old"), ("opencode.new", "new")]:
            binary = self.root / ".local/bin" / filename
            binary.write_text("#!/bin/sh\nprintf '%s\\n' " + version + "\n")
            binary.chmod(0o755)
        for command in ["curl", "launchctl", "lsof", "sleep"]:
            executable = self.root / "fake-bin" / command
            executable.write_text(FAKE)
            executable.chmod(0o755)
        (self.root / "state.json").write_text(json.dumps({"version": "old", "pid": 100}))
        self.database = sqlite3.connect(self.root / "opencode-feat-cow-ui.db")
        self.database.execute("PRAGMA journal_mode=WAL")
        self.database.execute("CREATE TABLE evidence(value INTEGER)")
        self.database.executemany("INSERT INTO evidence VALUES (?)", [(i,) for i in range(2000)])
        self.database.commit()
        self.environment = {
            **os.environ,
            "COW_DEPLOY_ROOT": str(self.root),
            "COW_DEPLOY_SERVICE": "gui/123/dev.bronson.cow-server",
            "COW_DEPLOY_JOBS": "test-job",
            "COW_DEPLOY_WAIT_ATTEMPTS": "1",
            "COW_DEPLOY_HEALTH_ATTEMPTS": "1",
            "COW_DEPLOY_WAIT_SECONDS": "0",
            "COW_DEPLOY_HEALTH_SECONDS": "0",
            "PATH": str(self.root / "fake-bin") + os.pathsep + os.environ["PATH"],
        }

    def tearDown(self):
        self.database.close()
        self.directory.cleanup()

    def deploy(self, scenario):
        (self.root / "status-calls").unlink(missing_ok=True)
        return subprocess.run(
            ["bash", str(SCRIPT)],
            env={**self.environment, "COW_DEPLOY_TEST_SCENARIO": scenario},
            capture_output=True, text=True, timeout=20,
        )

    def test_success_preserves_channel_and_wal_backup(self):
        result = self.deploy("success")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads((self.root / "state.json").read_text())["version"], "new")
        backups = list((self.root / ".coval/backups").glob("*/database.sqlite"))
        self.assertEqual(len(backups), 1)
        self.assertEqual(backups[0].stat().st_mode & 0o077, 0)
        with sqlite3.connect(backups[0]) as snapshot:
            self.assertEqual(snapshot.execute("SELECT count(*), sum(value) FROM evidence").fetchone(), (2000, 1999000))
        self.assertIn("old", (backups[0].parent / "opencode").read_text())
        self.assertFalse((self.root / ".coval/cow-deploy.lock").exists())
        self.assertNotIn("fixture-secret", (self.root / ".coval/logs/cow-deploy-server.log").read_text())

    def test_failed_preflight_never_swaps_or_restarts(self):
        for scenario in ["empty_status", "http_status", "invalid_status", "busy", "job_running", "job_unknown", "job_error", "bad_before", "db_unknown_before", "db_ambiguous", "busy_after_snapshot"]:
            with self.subTest(scenario=scenario):
                result = self.deploy(scenario)
                self.assertNotEqual(result.returncode, 0)
                self.assertTrue((self.root / ".local/bin/opencode.new").exists())
                self.assertEqual(json.loads((self.root / "state.json").read_text())["version"], "old")
                self.assertNotIn("kickstart", (self.root / "calls").read_text())

    def test_failed_verification_rolls_back_original_binary(self):
        for scenario in ["bad_after", "wrong_version", "db_unknown_after", "db_changed", "stale_pid"]:
            with self.subTest(scenario=scenario):
                staged = self.root / ".local/bin/opencode.new"
                staged.write_text("#!/bin/sh\nprintf '%s\\n' new\n")
                staged.chmod(0o755)
                result = self.deploy(scenario)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(json.loads((self.root / "state.json").read_text())["version"], "old")
                self.assertIn("old", (self.root / ".local/bin/opencode").read_text())
                self.assertIn("rollback verified", (self.root / ".coval/logs/cow-deploy-server.log").read_text())

    def test_expected_version_and_concurrent_deploy_fail_closed(self):
        self.environment["COW_DEPLOY_EXPECTED_VERSION"] = "different"
        self.assertNotEqual(self.deploy("success").returncode, 0)
        del self.environment["COW_DEPLOY_EXPECTED_VERSION"]
        (self.root / ".coval/cow-deploy.lock").mkdir()
        self.assertNotEqual(self.deploy("success").returncode, 0)
        self.assertTrue((self.root / ".coval/cow-deploy.lock").exists())
        self.assertTrue((self.root / ".local/bin/opencode.new").exists())


if __name__ == "__main__":
    unittest.main()
