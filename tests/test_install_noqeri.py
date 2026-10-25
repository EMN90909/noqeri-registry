"""Offline installer tests: OS choice, archive traversal, and trusted download selection."""
import importlib.util
import io
import json
import tarfile
import tempfile
import unittest
import zipfile
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

SRC=Path(__file__).resolve().parents[1]/"scripts"/"install_noqeri.py"
spec=importlib.util.spec_from_file_location("noqeri_installer",SRC)
installer=importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)

VERSION="0.1.3"
BASE="noqeri-v0.1.3-linux-x86_64"
FILENAME=BASE+".zip"
URL="https://github.com/EMN90909/Noqeri/releases/download/v0.1.3/"+FILENAME
SHA="1"*64

def catalog():
    return {"schema":1,"releases":[{"version":VERSION,"targets":[{
        "os":"linux","cpu":"x86_64","qualification":"executed",
        "gpu":{"architecture":"generic","backend":"cpu-fallback","hardware_qualified":False},
        "assets":[{"filename":FILENAME,"format":"zip","url":URL,"bytes":1234,"sha256":SHA}]
    }]}]}

class InstallerTests(unittest.TestCase):
    def test_select_trusted_target_and_no_gpu_fabrication(self):
        rel,target,asset=installer.select(catalog(),"linux","x86_64","generic",None,"zip")
        self.assertEqual(asset["url"],URL)
        with self.assertRaises(ValueError): installer.select(catalog(),"linux","arm64","generic",None,"zip")
        with self.assertRaises(ValueError): installer.select(catalog(),"linux","x86_64","nvidia-sm_90",None,"zip")
        bad=catalog()
        bad["releases"][0]["targets"][0]["assets"][0]["url"]="https://attacker.example/noqeri.zip"
        with self.assertRaises(ValueError): installer.select(bad,"linux","x86_64","generic",None,"zip")

    def test_safe_zip_unpack(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/"good.zip"
            with zipfile.ZipFile(path,"w") as z:
                z.writestr(BASE+"/bin/noqeri",b"test executable")
                z.writestr(BASE+"/bin/noqeri-nqri",b"vm executable")
            root=Path(tmp)/"out"
            binary=installer.unpack(path,"zip",root,BASE,"noqeri")
            self.assertEqual((binary/"bin/noqeri").read_bytes(),b"test executable")
            self.assertEqual((binary/"bin/noqeri-nqri").read_bytes(),b"vm executable")
            import os
            if os.name != "nt":
                self.assertTrue((binary/"bin/noqeri").stat().st_mode & 0o111)
                self.assertTrue((binary/"bin/noqeri-nqri").stat().st_mode & 0o111)

    def test_archive_traversal_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            zip_path=root/"bad.zip"
            with zipfile.ZipFile(zip_path,"w") as z:
                z.writestr(BASE+"/../outside",b"escape")
                z.writestr(BASE+"/bin/noqeri",b"test")
            with self.assertRaises(ValueError):
                installer.unpack(zip_path,"zip",root/"unzipped",BASE,"noqeri")
            tar_path=root/"bad.tar"
            with tarfile.open(tar_path,"w") as t:
                entry=tarfile.TarInfo("../bad")
                entry.size=3
                t.addfile(entry,io.BytesIO(b"bad"))
            with self.assertRaises(ValueError):
                installer.unpack(tar_path,"tar",root/"unpacked",BASE,"noqeri")

    def test_catalog_read_offline_and_os_arch_detection(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/"catalog.json"
            path.write_text(json.dumps(catalog()))
            self.assertEqual(len(installer.read_catalog(str(path))["releases"]),1)
            self.assertEqual(installer.ARCH["aarch64"],"arm64")
            self.assertFalse(installer.trusted_url("https://bad.example/archive",VERSION,FILENAME))
            self.assertTrue(installer.trusted_url(URL,VERSION,FILENAME))

    def test_empty_catalog_refuses_install(self):
        with self.assertRaises(ValueError):
            installer.select({"releases":[]},"linux","x86_64","generic",None,"zip")

if __name__=="__main__":unittest.main()
