"""Offline tests for published-asset validation and the HTML download directory."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

TOOL=Path(__file__).resolve().parents[1]/"scripts"/"sync_downloads.py"
spec=importlib.util.spec_from_file_location("download_catalog", TOOL)
sync=importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)

VERSION="0.1.3"
FILENAME="noqeri-v0.1.3-linux-x86_64.zip"
URL=f"https://github.com/EMN90909/Noqeri/releases/download/v{VERSION}/{FILENAME}"
SHA="b"*64

def fixture():
    release={"tag_name":"v"+VERSION,"draft":False,"prerelease":True,
             "published_at":"2026-10-25T00:00:00Z",
             "html_url":"https://github.com/EMN90909/Noqeri/releases/tag/v"+VERSION,
             "assets":[
                 {"name":"release-manifest.json","size":100},
                 {"name":FILENAME,"size":17,"browser_download_url":URL}
             ]}
    manifest={"schema":1,"product":"noqeri-compiler","version":VERSION,
              "channel":"preview","source_commit":"a"*40,
              "targets":[{"os":"linux","cpu":"x86_64","qualification":"executed",
                          "gpu":{"backend":"wgsl-emitter","architecture":"generic","hardware_qualified":False},
                          "assets":[{"filename":FILENAME,"format":"zip","bytes":17,"sha256":SHA}]}]}
    return release,manifest

class RegistryReleaseCatalogTests(unittest.TestCase):
    def test_valid_published_release(self):
        release,manifest=fixture()
        entry=sync.verify_release(release,manifest,verify_bytes=False)
        self.assertEqual(entry["targets"][0]["assets"][0]["url"],URL)
        self.assertIn("Linux",sync.page([entry]))

    def test_no_phantom_binaries(self):
        html=sync.page([])
        self.assertIn("Binary downloads not yet published",html)
        self.assertNotIn('href="https://github.com/EMN90909/Noqeri/releases/download/',html)

    def test_bad_url_and_digest_are_rejected(self):
        release,manifest=fixture()
        release["assets"][1]["browser_download_url"]="https://evil.example/malware.zip"
        with self.assertRaises(ValueError):
            sync.verify_release(release,manifest,verify_bytes=False)
        release,manifest=fixture()
        release["assets"][1]["digest"]="sha256:"+"0"*64
        with self.assertRaises(ValueError):
            sync.verify_release(release,manifest,verify_bytes=False)

    def test_fake_release_and_gpu_are_rejected(self):
        release,manifest=fixture()
        release["draft"]=True
        with self.assertRaises(ValueError):
            sync.verify_release(release,manifest,verify_bytes=False)
        release,manifest=fixture()
        manifest["targets"][0]["gpu"]["architecture"]="nvidia-sm_90"
        with self.assertRaises(ValueError):
            sync.verify_release(release,manifest,verify_bytes=False)

    def test_immutable_json_catalog_checks(self):
        release,manifest=fixture()
        valid=sync.verify_release(release,manifest,verify_bytes=False)
        with tempfile.TemporaryDirectory() as d:
            folder=Path(d)
            (folder/(VERSION+".json")).write_text(json.dumps(valid))
            self.assertEqual(sync.read_catalog(folder)[0]["version"],VERSION)
            valid["targets"][0]["assets"][0]["url"]="javascript:alert(1)"
            (folder/(VERSION+".json")).write_text(json.dumps(valid))
            with self.assertRaises(ValueError):
                sync.read_catalog(folder)

if __name__=="__main__":
    unittest.main()
