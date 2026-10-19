"""Check the real transport launcher without modifying a tunnel or tailnet policy."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).with_name("cow-public.sh")
HOST = "cow.fixture.ts.net"
FAKE = '''#!/usr/bin/env python3
import json, os, pathlib, sys
root = pathlib.Path(os.environ["COW_PHONE_CONFIG_DIR"])
if sys.argv[1:] == ["status", "--json"]:
    print((root / "status.json").read_text())
elif sys.argv[1:] == ["serve", "status", "--json"]:
    print((root / "serve.json").read_text())
else:
    (root / "invocation.json").write_text(json.dumps(sys.argv[1:]))
'''


class CowPublicTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="cow phone's transport ")
        self.root = Path(self.directory.name)
        self.binary = self.root / "transport"
        self.binary.write_text(FAKE)
        self.binary.chmod(0o755)
        self.status()
        (self.root / "serve.json").write_text("{}")
        self.environment = {
            **os.environ,
            "COW_PHONE_CONFIG_DIR": str(self.root),
            "COW_CLOUDFLARED_BIN": str(self.binary),
            "COW_TAILSCALE_BIN": str(self.binary),
        }

    def tearDown(self):
        self.directory.cleanup()

    def status(self, hostname=HOST, state="Running"):
        (self.root / "status.json").write_text(json.dumps({"BackendState": state, "Self": {"DNSName": hostname + "."}}))

    def configure(self, transport="funnel", origin="https://" + HOST + ":8443"):
        (self.root / "phone-transport").write_text(transport + "\n")
        (self.root / "phone-origin").write_text(origin + "\n")

    def run_script(self):
        return subprocess.run(["/bin/bash", str(SCRIPT)], env=self.environment, capture_output=True, text=True, timeout=5)

    def invocation(self):
        return json.loads((self.root / "invocation.json").read_text())

    def assert_refused(self):
        self.assertNotEqual(self.run_script().returncode, 0)
        self.assertFalse((self.root / "invocation.json").exists())

    def test_quick_tunnel_remains_default(self):
        self.assertEqual(self.run_script().returncode, 0)
        self.assertEqual(self.invocation(), ["tunnel", "--no-autoupdate", "--metrics", "127.0.0.1:0", "--url", "http://127.0.0.1:4098"])

    def test_named_cloudflare_remains_compatible_without_selector(self):
        (self.root / "phone-origin").write_text("https://cow.example.com")
        (self.root / "tunnel.yml").write_text("tunnel: existing")
        self.assertEqual(self.run_script().returncode, 0)
        self.assertEqual(self.invocation(), ["tunnel", "--no-autoupdate", "--config", str(self.root / "tunnel.yml"), "run"])

    def test_partial_cloudflare_configuration_fails_closed(self):
        (self.root / "phone-origin").write_text("https://cow.example.com")
        self.assert_refused()

    def test_funnel_uses_validated_port_and_foreground_supervision(self):
        for port in [443, 8443, 10000]:
            with self.subTest(port=port):
                self.configure(origin="https://" + HOST + ":" + str(port))
                self.assertEqual(self.run_script().returncode, 0)
                self.assertEqual(self.invocation(), ["funnel", "--yes", "--https=" + str(port), "http://127.0.0.1:4098"])

    def test_funnel_defaults_to_https(self):
        self.configure(origin="https://" + HOST + "/")
        self.assertEqual(self.run_script().returncode, 0)
        self.assertIn("--https=443", self.invocation())

    def test_funnel_does_not_start_on_a_different_device(self):
        self.configure()
        self.status(hostname="other.fixture.ts.net")
        self.assert_refused()

    def test_funnel_requires_running_tailscale(self):
        self.configure()
        self.status(state="NeedsLogin")
        self.assert_refused()

    def test_funnel_requires_origin(self):
        (self.root / "phone-transport").write_text("funnel")
        self.assert_refused()

    def test_invalid_origin_never_starts_a_transport(self):
        for origin in ["http://" + HOST, "https://cow.example.com", "https://" + HOST + ":1234", "https://" + HOST + "/path", "https://" + HOST + "?key=secret", "https://user@" + HOST]:
            with self.subTest(origin=origin):
                self.configure(origin=origin)
                self.assert_refused()

    def test_unknown_transport_does_not_fall_back(self):
        self.configure(transport="typo")
        self.assert_refused()

    def test_existing_unrelated_route_is_never_replaced(self):
        self.configure()
        (self.root / "serve.json").write_text(json.dumps({"TCP": {"8443": {"HTTPS": True}}, "Web": {HOST + ":8443": {"Handlers": {"/": {"Proxy": "http://127.0.0.1:4096"}}}}}))
        self.assert_refused()
        self.assertIn("occupied by another service", self.run_script().stderr)

    def test_owned_background_route_requires_explicit_migration(self):
        self.configure()
        (self.root / "serve.json").write_text(json.dumps({"TCP": {"8443": {"HTTPS": True}}, "Web": {HOST + ":8443": {"Handlers": {"/": {"Proxy": "http://127.0.0.1:4098"}}}}}))
        self.assert_refused()
        self.assertIn("already has an owner", self.run_script().stderr)

    def test_foreground_owners_are_preserved(self):
        self.configure()
        (self.root / "serve.json").write_text(json.dumps({"Foreground": {"existing-session": {"TCP": {"8443": {"HTTPS": True}}}}}))
        self.assert_refused()

    def test_other_handlers_on_the_same_port_are_preserved(self):
        self.configure()
        (self.root / "serve.json").write_text(json.dumps({"TCP": {"8443": {"HTTPS": True}}, "Web": {HOST + ":8443": {"Handlers": {"/": {"Proxy": "http://127.0.0.1:4098"}, "/other": {"Proxy": "http://127.0.0.1:8080"}}}}}))
        self.assert_refused()
        self.assertIn("occupied by another service", self.run_script().stderr)

    def test_unreadable_serve_configuration_fails_closed(self):
        self.configure()
        (self.root / "serve.json").write_text("invalid-json")
        self.assert_refused()

    def test_other_ports_do_not_block_startup(self):
        self.configure()
        (self.root / "serve.json").write_text(json.dumps({"TCP": {"443": {"HTTPS": True}}, "Web": {HOST + ":443": {"Handlers": {"/": {"Proxy": "http://127.0.0.1:4096"}}}}}))
        self.assertEqual(self.run_script().returncode, 0)
        self.assertIn("--https=8443", self.invocation())


if __name__ == "__main__":
    unittest.main()
