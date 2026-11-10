import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location(
    "stamp", Path(__file__).parent / "coval-scripts/stamp-check.py"
)
stamp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(stamp)

ME, TEAM = "UCALLUM", "TCOVAL"
LINK = "https://github.com/coval-ai/backend/pull/9033"


def msg(text, **changes):
    value = {"user": "UJAKE", "text": text, "ts": "1794330000.000100", "team": TEAM}
    value.update(changes)
    return value


def pull(**changes):
    value = {
        "state": "open",
        "draft": False,
        "user": {"login": "jakelevi"},
        "head": {"sha": "abc"},
    }
    value.update(changes)
    return value


class StampLinksTest(unittest.TestCase):
    def test_stamp_with_slack_formatted_link(self):
        self.assertEqual(
            stamp.stamp_links(msg(f"stamp pls <{LINK}|backend#9033>"), ME, TEAM),
            [("coval-ai/backend", 9033)],
        )
        self.assertEqual(
            stamp.stamp_links(msg(f"Stamp? {LINK}/files {LINK}"), ME, TEAM),
            [("coval-ai/backend", 9033)],
        )

    def test_needs_the_word_stamp(self):
        self.assertEqual(stamp.stamp_links(msg(f"look at {LINK}"), ME, TEAM), [])
        self.assertEqual(stamp.stamp_links(msg(f"timestamp bug {LINK}"), ME, TEAM), [])

    def test_sender_guards(self):
        for m in [
            msg(f"stamp {LINK}", user=ME),
            msg(f"stamp {LINK}", bot_id="B1"),
            msg(f"stamp {LINK}", subtype="bot_message"),
            msg(f"stamp {LINK}", team="TOTHER"),
            msg(f"stamp {LINK}", user_team="TOTHER"),
        ]:
            self.assertEqual(stamp.stamp_links(m, ME, TEAM), [])

    def test_only_coval_ai_repos(self):
        self.assertEqual(
            stamp.stamp_links(
                msg("stamp https://github.com/evil/repo/pull/1"), ME, TEAM
            ),
            [],
        )
        self.assertEqual(
            stamp.stamp_links(
                msg("stamp https://github.com/Coval-AI/frontend/pull/8832"), ME, TEAM
            ),
            [("coval-ai/frontend", 8832)],
        )


class DecisionTest(unittest.TestCase):
    def test_approved_at_head(self):
        mine = {"login": "callumreid", "state": "APPROVED", "commit_id": "abc"}
        self.assertTrue(stamp.approved_at_head([mine], "callumreid", "abc"))
        self.assertFalse(stamp.approved_at_head([mine], "callumreid", "new"))
        self.assertFalse(stamp.approved_at_head([], "callumreid", "abc"))
        dismissed = {"login": "callumreid", "state": "DISMISSED", "commit_id": "abc"}
        self.assertFalse(stamp.approved_at_head([mine, dismissed], "callumreid", "abc"))
        comment = {"login": "callumreid", "state": "COMMENTED", "commit_id": "abc"}
        self.assertTrue(stamp.approved_at_head([mine, comment], "callumreid", "abc"))
        other = {"login": "jakelevi", "state": "APPROVED", "commit_id": "abc"}
        self.assertFalse(stamp.approved_at_head([other], "callumreid", "abc"))

    def test_skip_reasons(self):
        repo = "coval-ai/backend"
        self.assertIsNone(stamp.skip_reason(repo, pull(), "callumreid"))
        self.assertEqual(
            stamp.skip_reason(repo, pull(draft=True), "callumreid"), "draft"
        )
        self.assertEqual(
            stamp.skip_reason(repo, pull(state="closed"), "callumreid"), "closed"
        )
        self.assertEqual(
            stamp.skip_reason(repo, pull(state="closed", merged_at="x"), "callumreid"),
            "merged",
        )
        self.assertEqual(
            stamp.skip_reason(repo, pull(user={"login": "callumreid"}), "callumreid"),
            "Callum's own PR",
        )
        self.assertIn(
            "robyoungsf",
            stamp.skip_reason(repo, pull(user={"login": "robyoungsf"}), "callumreid"),
        )
        self.assertIsNone(
            stamp.skip_reason(
                "coval-ai/frontend", pull(user={"login": "robyoungsf"}), "callumreid"
            )
        )


class ModelVerdictTest(unittest.TestCase):
    def test_parse_verdict(self):
        self.assertEqual(
            stamp.parse_verdict("Clear ask.\nVERDICT: APPROVE"), ("approve", "")
        )
        self.assertEqual(
            stamp.parse_verdict("They said wait.\nVERDICT: SKIP - not ready yet"),
            ("skip", "not ready yet"),
        )
        self.assertEqual(
            stamp.parse_verdict("VERDICT: SKIP"), ("skip", "model said skip")
        )
        self.assertIsNone(stamp.parse_verdict("I think you should approve it"))
        # the last verdict wins, e.g. when the model quotes the format first
        self.assertEqual(
            stamp.parse_verdict(
                "VERDICT: APPROVE or VERDICT: SKIP\nVERDICT: SKIP - unclear"
            )[0],
            "skip",
        )

    def test_final_reply_reads_last_assistant_turn(self):
        msgs = [
            {"info": {"role": "user"}, "parts": [{"type": "text", "text": "prompt"}]},
            {
                "info": {"role": "assistant"},
                "parts": [
                    {"type": "reasoning", "text": "hmm"},
                    {"type": "text", "text": "VERDICT: APPROVE"},
                ],
            },
        ]
        self.assertEqual(stamp.final_reply(msgs), "VERDICT: APPROVE")
        self.assertEqual(stamp.final_reply(msgs[:1]), "")

    def test_prompt_fences_the_message(self):
        prompt = stamp.judge_prompt(
            "coval-ai/backend#1", "Jake", "stamp pls", pull(title="Fix it")
        )
        self.assertIn("<<<\nstamp pls\n>>>", prompt)
        self.assertIn('"Fix it" by jakelevi', prompt)


class StateTest(unittest.TestCase):
    def test_migrates_old_cursor_map(self):
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
            json.dump({"D1": 1794330000.0001}, f)
        state = stamp.load_state(f.name)
        self.assertEqual(state["cursors"], {"D1": 1794330000.0001})
        self.assertEqual((state["seen"], state["retry"]), ({}, []))

    def test_prunes_old_seen(self):
        self.assertEqual(
            stamp.prune_seen({"a": 100.0, "b": 1_000_000.0}, 1_000_010.0),
            {"b": 1_000_000.0},
        )


if __name__ == "__main__":
    unittest.main()
