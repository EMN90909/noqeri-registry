import gzip
import hashlib
import http.client
import io
import json
import os
import re
import select
import subprocess
import tarfile
import time
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BINARY = Path(os.environ.get("REGISTRY_NATIVE_BINARY", ROOT / "build/native/noqeri-registry"))


class NativeRegistryTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not BINARY.is_file():
            raise RuntimeError(f"Compile actual Noqeri binary first: {BINARY}")
        env = dict(os.environ)
        env.update(REGISTRY_SOURCE_INDEX_PREVIEW="1", REGISTRY_ROOT=str(ROOT), REGISTRY_HOST="127.0.0.1", PORT="0")
        cls.proc = subprocess.Popen(
            [str(BINARY)], cwd=ROOT, env=env, text=True,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=1,
        )
        ready, _, _ = select.select([cls.proc.stdout], [], [], 60)
        if not ready:
            cls.proc.kill()
            raise RuntimeError(f"native server startup timed out (exit={cls.proc.poll()})")
        line = cls.proc.stdout.readline().strip()
        matched = re.search(r"127\.0\.0\.1:(\d+)$", line)
        if not matched:
            if cls.proc.poll() is None:
                cls.proc.terminate()
            _, stderr = cls.proc.communicate(timeout=5)
            raise RuntimeError(f"native server did not start: {line!r}; exit={cls.proc.returncode}; stderr={stderr[-4000:]}")
        cls.port = int(matched.group(1))

    @classmethod
    def tearDownClass(cls):
        cls.proc.terminate()
        try:
            cls.proc.communicate(timeout=5)
        except subprocess.TimeoutExpired:
            cls.proc.kill()
            cls.proc.communicate()

    def request(self, method, path):
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        try:
            conn.request(method, path)
            response = conn.getresponse()
            status, headers, body = response.status, dict(response.getheaders()), response.read()
            return status, headers, body
        finally:
            conn.close()

    def test_registry_index_matches_canonical_source(self):
        status, _, body = self.request("GET", "/v1/index")
        self.assertEqual(status, 200)
        value = json.loads(body)
        self.assertEqual(value["protocol"], "v1")
        self.assertEqual(len(value["packages"]), 55)
        std = next(p for p in value["packages"] if p["name"] == "std")
        self.assertIn("0.1.0", [v["version"] for v in std["versions"]])
        self.assertIn("0.4.0", [v["version"] for v in std["versions"]])

    def test_status_is_truthful(self):
        status, _, body = self.request("GET", "/v1/status")
        self.assertEqual(status, 200)
        data = json.loads(body)
        self.assertEqual(data["storage"], "source-index-preview")
        self.assertFalse(data["nativeQualified"])
        self.assertFalse(data["publishingEnabled"])

    def test_routes_search_and_head(self):
        status, headers, body = self.request("GET", "/v1/search?q=core&limit=1&offset=0")
        self.assertEqual(status, 200)
        data = json.loads(body)
        self.assertGreater(data["total"], 0)
        self.assertEqual(len(data["packages"]), 1)
        self.assertEqual(data["limit"], 1)
        status, _, _ = self.request("GET", "/v1/search?q=core&limit=101")
        self.assertEqual(status, 400)
        status, _, _ = self.request("GET", "/v1/search?q=core&offset=-1")
        self.assertEqual(status, 400)
        status, headers, body = self.request("HEAD", "/v1/index")
        self.assertEqual(status, 200)
        self.assertEqual(body, b"")
        self.assertGreater(int(headers["Content-Length"]), 10)
        status, _, body = self.request("POST", "/v1/packages")
        self.assertEqual(status, 405)
        self.assertEqual(json.loads(body)["error"], "method_not_allowed")

    def test_immutable_download_is_sha256_verified(self):
        path = "/v1/packages/noqeri/core/0.1.0"
        status, _, body = self.request("GET", path)
        self.assertEqual(status, 200)
        info = json.loads(body)
        self.assertEqual(info["entry"], "src/core.noqeri")
        status, headers, archive = self.request("GET", path + "/download")
        self.assertEqual(status, 200)
        digest = hashlib.sha256(archive).hexdigest()
        self.assertEqual(headers["X-Archive-SHA256"], digest)
        self.assertEqual(info["archiveIntegrity"], "sha256:" + digest)
        self.assertEqual(headers["Content-Type"], "application/vnd.noqeri.package+gzip")
        with tarfile.open(fileobj=io.BytesIO(archive), mode="r:gz") as tar:
            names = tar.getnames()
            self.assertIn("package.noqeri", names)
            self.assertIn("src/core.noqeri", names)
            self.assertNotIn("package.nqr", names)
        status, headers, data = self.request("HEAD", path + "/download")
        self.assertEqual(status, 200)
        self.assertEqual(int(headers["Content-Length"]), len(archive))
        self.assertEqual(data, b"")

    def test_yanked_or_unsafe_fail_closed(self):
        self.assertEqual(self.request("GET", "/v1/packages/noqeri/core/1.0.0/download")[0], 404)
        self.assertEqual(self.request("GET", "/v1/packages/noqeri/%2e%2e%2fescape/0.1.0")[0], 400)
        self.assertEqual(self.request("GET", "/v1/packages/noqeri/core/not-a-version")[0], 400)
        self.assertEqual(self.request("GET", "/unknown")[0], 404)
        self.assertEqual(self.request("GET", "/v1/search?q=" + ("x" * 130))[0], 400)
        self.assertEqual(self.request("GET", "/v1/search?q=" + ("x" * 2050))[0], 414)


if __name__ == "__main__":
    unittest.main()
