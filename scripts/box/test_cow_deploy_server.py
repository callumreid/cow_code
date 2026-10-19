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
status_calls = int((root / "status-calls").read_text()) if (root / "status-calls").exists() else 0
directories = os.environ.get("COW_DEPLOY_DIRECTORIES", os.environ.get("COW_DEPLOY_DIRECTORY", "/Users/bronson/coval") + "\n" + str(root / ".local/share/opencode/office")).splitlines()
if command == "sleep":
    sys.exit(0)
if command == "curl":
    if sys.argv[-1].endswith("/session/status"):
        directory = next(arg.removeprefix("x-opencode-directory: ") for arg in sys.argv if arg.startswith("x-opencode-directory: "))
        with (root / "checked-directories").open("a") as log: log.write(directory + "\n")
        calls = root / "status-calls"
        count = int(calls.read_text()) + 1 if calls.exists() else 1
        calls.write_text(str(count))
        if scenario == "empty_status": sys.exit(0)
        if scenario == "http_status": sys.exit(22)
        if scenario == "invalid_status": print("[]"); sys.exit(0)
        if scenario == "null_session": print('{"session":null}'); sys.exit(0)
        if scenario == "unknown_status" or (scenario == "unknown_after_snapshot" and count > len(directories)) or (scenario == "second_unknown" and directory == directories[1]): print('{"session":{"type":"unknown"}}'); sys.exit(0)
        if scenario == "second_http" and directory == directories[1]: sys.exit(22)
        if scenario == "retry": print('{"session":{"type":"retry","attempt":2,"next":100,"message":"provider unavailable"}}'); sys.exit(0)
        busy = scenario == "busy" or (scenario == "busy_and_job" and directory == directories[0]) or (scenario == "second_busy" and directory == directories[1]) or (scenario == "busy_after_snapshot" and count > len(directories))
        print(json.dumps({"session": {"type": "busy"}} if busy else {}))
        sys.exit(0)
    if scenario == "bad_before": print("<html>bad gateway</html>"); sys.exit(0)
    if scenario == "health_after_snapshot" and status_calls: print('{"healthy":false,"version":"old"}'); sys.exit(0)
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
        print("service = {\n pid = " + str(state["pid"] + (1 if scenario == "pid_after_snapshot" and status_calls > len(directories) else 0)) + "\n}")
        sys.exit(0)
    if scenario == "job_error": print("permission denied", file=sys.stderr); sys.exit(1)
    if scenario == "job_unknown": print("service = {}"); sys.exit(0)
    if scenario == "job_unknown_after_snapshot" and status_calls > len(directories): print("service = {}"); sys.exit(0)
    if scenario == "job_unknown_nested": print(" state = unknown\n resource = {\n  state = running\n }"); sys.exit(0)
    if scenario == "job_ambiguous": print(" state = running\n state = not running"); sys.exit(0)
    if scenario == "job_nested_idle": print(" state = not running\n resource = {\n  state = active\n }"); sys.exit(0)
    if scenario in ["job_running", "busy_and_job"]: print(" state = running\n resource = {\n  state = active\n }"); sys.exit(0)
    print("Could not find service", file=sys.stderr)
    sys.exit(113)
if command == "lsof":
    if scenario == "db_unknown_before" or (state["version"] == "new" and scenario == "db_unknown_after"): sys.exit(1)
    if scenario == "db_ambiguous": print("n" + str(root / "opencode-other.db"))
    filename = "opencode-other.db" if (state["version"] == "new" and scenario == "db_changed") or (scenario == "db_after_snapshot" and status_calls > len(directories)) else "opencode-feat-cow-ui.db"
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
            "COW_DEPLOY_DIRECTORY": "/Users/bronson/coval",
            "COW_DEPLOY_WAIT_ATTEMPTS": "1",
            "COW_DEPLOY_HEALTH_ATTEMPTS": "1",
            "COW_DEPLOY_WAIT_SECONDS": "0",
            "COW_DEPLOY_HEALTH_SECONDS": "0",
            "PATH": str(self.root / "fake-bin") + os.pathsep + os.environ["PATH"],
        }
        self.environment.pop("COW_DEPLOY_DIRECTORIES", None)

    def tearDown(self):
        self.database.close()
        self.directory.cleanup()

    def deploy(self, scenario, *arguments):
        (self.root / "status-calls").unlink(missing_ok=True)
        return subprocess.run(
            ["bash", str(SCRIPT), *arguments],
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
        for scenario in ["empty_status", "http_status", "invalid_status", "null_session", "unknown_status", "busy", "retry", "second_busy", "second_unknown", "second_http", "job_running", "job_unknown", "job_unknown_nested", "job_ambiguous", "job_error", "bad_before", "db_unknown_before", "db_ambiguous", "busy_after_snapshot", "unknown_after_snapshot"]:
            with self.subTest(scenario=scenario):
                result = self.deploy(scenario)
                self.assertNotEqual(result.returncode, 0)
                self.assertTrue((self.root / ".local/bin/opencode.new").exists())
                self.assertEqual(json.loads((self.root / "state.json").read_text())["version"], "old")
                self.assertNotIn("kickstart", (self.root / "calls").read_text())

    def test_busy_override_logs_counts_labels_and_preserves_snapshot(self):
        self.environment["COW_DEPLOY_JOBS"] = "test-job another-job"
        result = self.deploy("busy_and_job", "--allow-busy")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads((self.root / "state.json").read_text())["version"], "new")
        log = (self.root / ".coval/logs/cow-deploy-server.log").read_text()
        self.assertIn("explicit --allow-busy: proceeding with 1 session entries, scheduled jobs active=2 [test-job,another-job]", log)
        self.assertIn("explicit --allow-busy at final recheck: 1 session entries, scheduled jobs active=2 [test-job,another-job]", log)
        self.assertIn("/Users/bronson/coval=1; " + str(self.root / ".local/share/opencode/office") + "=0", log)
        self.assertIn("active work may be interrupted", log)
        self.assertIn("deploy verified: new", log)
        self.assertNotIn("fixture-secret", log)
        self.assertNotIn("sleep", (self.root / "calls").read_text())
        backups = list((self.root / ".coval/backups").glob("*/database.sqlite"))
        self.assertEqual(len(backups), 1)
        with sqlite3.connect(backups[0]) as snapshot:
            self.assertEqual(snapshot.execute("SELECT count(*), sum(value) FROM evidence").fetchone(), (2000, 1999000))

    def test_busy_override_handles_work_appearing_during_snapshot(self):
        result = self.deploy("busy_after_snapshot", "--allow-busy")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("explicit --allow-busy at final recheck: 2 session entries", (self.root / ".coval/logs/cow-deploy-server.log").read_text())

    def test_second_workspace_busy_requires_explicit_override(self):
        result = self.deploy("second_busy")
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn("kickstart", (self.root / "calls").read_text())
        result = self.deploy("second_busy", "--allow-busy")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("/Users/bronson/coval=0; " + str(self.root / ".local/share/opencode/office") + "=1", (self.root / ".coval/logs/cow-deploy-server.log").read_text())

    def test_explicit_workspace_list_preserves_spaces_and_scopes(self):
        directories = [str(self.root / "custom workspace"), str(self.root / "another worktree"), str(self.root / "third")]
        self.environment["COW_DEPLOY_DIRECTORIES"] = "\n".join(directories)
        result = self.deploy("success")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual((self.root / "checked-directories").read_text().splitlines(), directories * 2)
        log = (self.root / ".coval/logs/cow-deploy-server.log").read_text()
        self.assertIn("configured workspaces [" + "; ".join(directory + "=0" for directory in directories) + "]", log)

    def test_invalid_workspace_list_fails_closed(self):
        for value in ["", "relative/path", "/absolute\n\n/another"]:
            with self.subTest(value=value):
                self.environment["COW_DEPLOY_DIRECTORIES"] = value
                result = self.deploy("success", "--allow-busy")
                self.assertNotEqual(result.returncode, 0)
                self.assertNotIn("kickstart", (self.root / "calls").read_text())

    def test_busy_override_handles_waiting_provider(self):
        result = self.deploy("retry", "--allow-busy")
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_busy_override_still_refuses_unknown_or_unhealthy_state(self):
        for scenario in ["empty_status", "http_status", "invalid_status", "null_session", "unknown_status", "unknown_after_snapshot", "second_unknown", "second_http", "job_unknown", "job_unknown_after_snapshot", "job_unknown_nested", "job_ambiguous", "job_error", "bad_before", "db_unknown_before", "db_ambiguous", "health_after_snapshot", "pid_after_snapshot", "db_after_snapshot"]:
            with self.subTest(scenario=scenario):
                result = self.deploy(scenario, "--allow-busy")
                self.assertNotEqual(result.returncode, 0)
                self.assertTrue((self.root / ".local/bin/opencode.new").exists())
                self.assertEqual(json.loads((self.root / "state.json").read_text())["version"], "old")
                self.assertNotIn("kickstart", (self.root / "calls").read_text())

    def test_idle_job_uses_outer_state(self):
        result = self.deploy("job_nested_idle")
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_unknown_argument_does_not_start_deployment(self):
        result = self.deploy("success", "--allow-busy", "--force")
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse((self.root / "calls").exists())
        self.assertFalse((self.root / ".coval/cow-deploy.lock").exists())
        self.assertTrue((self.root / ".local/bin/opencode.new").exists())

    def test_failed_verification_rolls_back_original_binary(self):
        for arguments in [(), ("--allow-busy",)]:
            for scenario in ["bad_after", "wrong_version", "db_unknown_after", "db_changed", "stale_pid"]:
                with self.subTest(scenario=scenario, arguments=arguments):
                    staged = self.root / ".local/bin/opencode.new"
                    staged.write_text("#!/bin/sh\nprintf '%s\\n' new\n")
                    staged.chmod(0o755)
                    result = self.deploy(scenario, *arguments)
                    self.assertNotEqual(result.returncode, 0)
                    self.assertEqual(json.loads((self.root / "state.json").read_text())["version"], "old")
                    self.assertIn("old", (self.root / ".local/bin/opencode").read_text())
                    self.assertIn("rollback verified", (self.root / ".coval/logs/cow-deploy-server.log").read_text())

    def test_expected_version_and_concurrent_deploy_fail_closed(self):
        self.environment["COW_DEPLOY_EXPECTED_VERSION"] = "different"
        self.assertNotEqual(self.deploy("success").returncode, 0)
        self.assertNotEqual(self.deploy("success", "--allow-busy").returncode, 0)
        del self.environment["COW_DEPLOY_EXPECTED_VERSION"]
        (self.root / ".coval/cow-deploy.lock").mkdir()
        self.assertNotEqual(self.deploy("success").returncode, 0)
        self.assertNotEqual(self.deploy("success", "--allow-busy").returncode, 0)
        self.assertTrue((self.root / ".coval/cow-deploy.lock").exists())
        self.assertTrue((self.root / ".local/bin/opencode.new").exists())


if __name__ == "__main__":
    unittest.main()
