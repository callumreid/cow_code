import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location(
    "requests", Path(__file__).parent / "coval-scripts/pr-review-requests.py")
lane = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lane)


def pull(**changes):
    value = {"state": "open", "draft": False, "user": {"login": "samira-ks"},
             "base": {"repo": {"name": "clustering-workbench"}}, "number": 51,
             "head": {"sha": "abc"}, "requested_reviewers": [{"login": "callumreid"}],
             "created_at": "2026-10-14T20:21:29Z"}
    value.update(changes)
    return value


class ReviewRequestsTest(unittest.TestCase):
    def test_direct_request_across_repos(self):
        self.assertTrue(lane.eligible(pull()))
        self.assertTrue(lane.eligible(pull(user={"login": "jakelevi"})))

    def test_no_tag_is_not_a_request(self):
        self.assertFalse(lane.eligible(pull(requested_reviewers=[])))

    def test_scope_guards(self):
        for pr in [pull(draft=True), pull(state="closed"), pull(user={"login": "callumreid"}),
                   pull(user={"login": "robyoungsf"})]:
            self.assertFalse(lane.eligible(pr))
        self.assertTrue(lane.eligible(pull(user={"login": "robyoungsf"}, base={"repo": {"name": "frontend"}})))

    def test_paginated_arrays_include_late_request(self):
        with patch.object(lane.subprocess, "run", return_value=subprocess.CompletedProcess([], 0, '[1,2]\n[]\n[3]')):
            self.assertEqual(lane.api("pages"), [1, 2, 3])

    def test_failed_and_error_payloads_do_not_clear_queue(self):
        with patch.object(lane.subprocess, "run", side_effect=subprocess.CalledProcessError(1, "gh")):
            with self.assertRaises(subprocess.CalledProcessError):
                lane.api("pages")
        with patch.object(lane.subprocess, "run", return_value=subprocess.CompletedProcess([], 0, '{"errors": []}')):
            with self.assertRaises(ValueError):
                lane.api("pages")

    def test_discovery_uses_authoritative_lists_and_skips_archived(self):
        seen = []
        def api(endpoint):
            seen.append(endpoint)
            if endpoint.startswith("orgs/"):
                return [{"name": "clustering-workbench", "archived": False, "disabled": False},
                        {"name": "old", "archived": True, "disabled": False}]
            return [pull(), pull(number=52, requested_reviewers=[])]
        with patch.object(lane, "api", side_effect=api):
            self.assertEqual([p["number"] for p in lane.discover()], [51])
        self.assertEqual(len(seen), 2)
        self.assertFalse(any("search" in endpoint for endpoint in seen))

    def test_same_head_rerequest_has_new_identity(self):
        event = {"id": 1, "event": "review_requested", "created_at": "2026-10-14T20:00:00Z",
                 "requested_reviewer": {"login": "callumreid"}}
        with patch.object(lane, "api", return_value=[event]):
            old = lane.request(pull())
        new = copy.deepcopy(event)
        new.update(id=2, created_at="2026-10-14T21:00:00Z")
        with patch.object(lane, "api", return_value=[new, event]):
            current = lane.request(pull())
        self.assertNotEqual(old["key"], current["key"])
        review = {"user": {"login": "callumreid"}, "commit_id": "abc", "state": "APPROVED",
                  "submitted_at": "2026-10-14T20:30:00Z"}
        self.assertTrue(lane.served([review], "abc", old["at"], ""))
        self.assertFalse(lane.served([review], "abc", current["at"], ""))
        review["submitted_at"] = "2026-10-14T21:30:00Z"
        self.assertTrue(lane.served([review], "abc", current["at"], ""))

    def test_other_reviewer_and_old_head_never_consume_request(self):
        review = {"user": {"login": "jakelevi"}, "commit_id": "abc", "state": "APPROVED",
                  "submitted_at": "2026-10-14T22:00:00Z"}
        self.assertFalse(lane.served([review], "abc", "2026-10-14T21:00:00Z", ""))
        review["user"]["login"] = "callumreid"
        self.assertFalse(lane.served([review], "different-head", "2026-10-14T21:00:00Z", ""))

    def test_duplicate_worker_cannot_enter_same_pr(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(lane, "STATE", Path(directory)), \
                patch.object(lane, "request", return_value={"key": "x", "at": None}), \
                patch.object(lane, "execute") as execute:
            with (Path(directory) / "clustering-workbench-51.lock").open("w") as lock:
                lane.fcntl.flock(lock, lane.fcntl.LOCK_EX)
                self.assertIsNone(lane.review(pull(), False))
            execute.assert_not_called()

    def test_provider_capacity_leaves_requests_pending(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(lane, "STATE", Path(directory)), \
                patch.object(lane, "request", return_value={"key": "x", "at": None}), \
                patch.object(lane, "execute") as execute:
            locks = [(Path(directory) / f"slot-{i}.lock").open("w") for i in range(4)]
            try:
                for lock in locks:
                    lane.fcntl.flock(lock, lane.fcntl.LOCK_EX)
                self.assertIsNone(lane.review(pull(), False))
                execute.assert_not_called()
            finally:
                for lock in locks:
                    lock.close()


if __name__ == "__main__":
    unittest.main()
