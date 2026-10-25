#!/usr/bin/env python3
"""Verify and install a real published Noqeri compiler archive. Python >=3.9.

No executable is run by this installer. All URLs must be official HTTPS GitHub
Release URLs and every downloaded byte must match the registered SHA-256.
"""
from __future__ import annotations
import argparse
import gzip
import hashlib
import io
import json
import os
import platform
import re
import shutil
import stat
import sys
import tarfile
import tempfile
import urllib.request
import zipfile
from pathlib import Path

BASE="https://github.com/EMN90909/Noqeri"
DEFAULT="https://raw.githubusercontent.com/EMN90909/noqeri-registry/main/downloads/releases.json"
ARCH={"amd64":"x86_64","x86_64":"x86_64","aarch64":"arm64","arm64":"arm64",
      "armv7l":"armv7","armv7":"armv7","i386":"x86","i686":"x86",
      "riscv64":"riscv64","ppc64le":"ppc64le","s390x":"s390x"}
MAX_ARCHIVE=1024*1024*1024
MAX_UNPACKED=1536*1024*1024
MAX_FILES=4096

def detect_os():
    if os.environ.get("ANDROID_ROOT") and sys.platform.startswith("linux"): return "android"
    if sys.platform.startswith("linux"): return "linux"
    if sys.platform=="darwin": return "macos"
    if sys.platform=="win32": return "windows"
    if sys.platform.startswith("freebsd"): return "freebsd"
    if sys.platform.startswith("openbsd"): return "openbsd"
    raise ValueError("unknown OS; select --os custom-... explicitly")

def detect_cpu():
    cpu=ARCH.get(platform.machine().lower())
    if not cpu: raise ValueError("unknown CPU; select --cpu explicitly")
    return cpu

def trusted_url(url,version,name):
    return isinstance(url,str) and url==f"{BASE}/releases/download/v{version}/{name}"

def read_catalog(url):
    if Path(url).is_file():
        raw=Path(url).read_bytes()
    else:
        if not url.startswith("https://"): raise ValueError("HTTPS catalog URL required")
        with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"Noqeri-install/1"}),timeout=30) as stream:
            raw=stream.read(8*1024*1024+1)
    if len(raw)>8*1024*1024: raise ValueError("catalog exceeds 8 MiB")
    data=json.loads(raw)
    if data.get("schema")!=1 or not isinstance(data.get("releases"),list):
        raise ValueError("unrecognized release catalog")
    return data

def select(data,os_name,cpu,gpu,version,fmt):
    releases=data["releases"]
    if version:
        releases=[r for r in releases if r.get("version")==version]
    else:
        # Catalog has newest-first versions; never choose a fabricated version.
        releases=sorted(releases,key=lambda r:tuple(map(int,r["version"].split("-")[0].split("."))),reverse=True)
    for release in releases:
        for target in release.get("targets",[]):
            g=target.get("gpu",{})
            if target.get("os")!=os_name or target.get("cpu")!=cpu or g.get("architecture")!=gpu:
                continue
            if gpu!="generic" and not g.get("hardware_qualified"):
                raise ValueError("selected vendor GPU has no runtime qualification")
            for asset in target.get("assets",[]):
                if asset.get("format")!=fmt: continue
                if not trusted_url(asset.get("url"),release["version"],asset.get("filename")):
                    raise ValueError("untrusted executable download URL")
                if not re.fullmatch("[0-9a-f]{64}",asset.get("sha256","")):
                    raise ValueError("missing/invalid asset SHA-256")
                if not isinstance(asset.get("bytes"),int) or not 0<asset["bytes"]<=MAX_ARCHIVE:
                    raise ValueError("invalid artifact length")
                return release,target,asset
    raise ValueError("no verified published asset for this OS/CPU/GPU/format")

def fetch_file(asset,destination):
    sha=hashlib.sha256()
    total=0
    with urllib.request.urlopen(urllib.request.Request(asset["url"],headers={"User-Agent":"Noqeri-install/1"}),timeout=90) as src, destination.open("wb") as out:
        while True:
            chunk=src.read(1024*1024)
            if not chunk: break
            total+=len(chunk)
            if total>asset["bytes"] or total>MAX_ARCHIVE:
                raise ValueError("download exceeds declared length")
            sha.update(chunk)
            out.write(chunk)
    if total!=asset["bytes"] or sha.hexdigest()!=asset["sha256"]:
        raise ValueError("archive integrity mismatch; refusing installation")

def safe_member(name,root_name):
    if not isinstance(name,str) or "\0" in name or "\\" in name or name.startswith("/"):
        raise ValueError("unsafe archive member")
    parts=name.rstrip("/").split("/")
    if len(parts)<2 or parts[0]!=root_name or any(p in ("",".","..") for p in parts):
        raise ValueError("unsafe archive path")
    return parts

def unpack(path,fmt,folder,root_name,exe):
    count=0
    size=0
    if fmt=="zip":
        with zipfile.ZipFile(path) as archive:
            for info in archive.infolist():
                parts=safe_member(info.filename,root_name)
                mode=(info.external_attr>>16)&0o170000
                if mode==0o120000: raise ValueError("archive symlink forbidden")
                if info.is_dir(): continue
                count+=1;size+=info.file_size
                if count>MAX_FILES or size>MAX_UNPACKED: raise ValueError("unpacked size/file limit")
                dest=folder.joinpath(*parts)
                dest.parent.mkdir(parents=True,exist_ok=True)
                with archive.open(info) as src,dest.open("wb") as out:
                    shutil.copyfileobj(src,out,length=1024*1024)
    elif fmt in ("tar","tar.gz"):
        with tarfile.open(path,mode="r:gz" if fmt=="tar.gz" else "r:") as archive:
            for member in archive:
                parts=safe_member(member.name,root_name)
                if member.isdir(): continue
                if not member.isfile(): raise ValueError("archive special file forbidden")
                count+=1;size+=member.size
                if count>MAX_FILES or size>MAX_UNPACKED: raise ValueError("unpacked size/file limit")
                dest=folder.joinpath(*parts)
                dest.parent.mkdir(parents=True,exist_ok=True)
                with archive.extractfile(member) as src,dest.open("wb") as out:
                    shutil.copyfileobj(src,out,length=1024*1024)
    else:
        dest=folder/root_name/"bin"/exe
        dest.parent.mkdir(parents=True,exist_ok=True)
        if fmt=="binary":
            shutil.copy2(path,dest)
        elif fmt=="gz":
            with gzip.open(path,"rb") as src,dest.open("wb") as out:
                while True:
                    chunk=src.read(1024*1024)
                    if not chunk: break
                    size+=len(chunk)
                    if size>MAX_UNPACKED: raise ValueError("unpacked executable too large")
                    out.write(chunk)
        else: raise ValueError("unsupported archive format")
    executable=folder/root_name/"bin"/exe
    if not executable.is_file() or executable.stat().st_size==0:
        raise ValueError("bundle does not contain the Noqeri compiler")
    if os.name!="nt":
        for binary in (executable, folder/root_name/"bin"/"noqeri-nqri"):
            if binary.is_file():
                binary.chmod(binary.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    return folder/root_name

def install(args):
    os_name=args.os or detect_os()
    cpu=args.cpu or detect_cpu()
    fmt=args.format or ("zip" if os_name=="windows" else "tar.gz")
    data=read_catalog(args.catalog)
    release,target,asset=select(data,os_name,cpu,args.gpu_arch,args.version,fmt)
    name=f"noqeri-v{release['version']}-{os_name}-{cpu}" + (f"-{args.gpu_arch}" if args.gpu_arch!="generic" else "")
    default=Path(os.environ.get("LOCALAPPDATA",str(Path.home()))) / "Noqeri" if os_name=="windows" else Path.home()/".local"/"opt"/"noqeri"
    root=Path(args.prefix).expanduser().resolve() if args.prefix else default
    destination=root/name
    if destination.exists(): raise ValueError("install target already exists; refusing overwrite: "+str(destination))
    root.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".noqeri-",dir=root) as temp:
        scratch=Path(temp)
        archive=scratch/asset["filename"]
        fetch_file(asset,archive)
        unpacked=unpack(archive,fmt,scratch,name,"noqeri.exe" if os_name=="windows" else "noqeri")
        shutil.move(str(unpacked),str(destination))
    print("Installed Noqeri v"+release["version"]+" to "+str(destination))
    print("Binary: "+str(destination/"bin"/("noqeri.exe" if os_name=="windows" else "noqeri")))
    print("Evidence: "+target["qualification"]+"; GPU: "+target["gpu"]["architecture"])

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--catalog",default=DEFAULT,help="HTTPS registry releases JSON or local file")
    p.add_argument("--os",help="OS override (for custom OS, e.g. custom-myos)")
    p.add_argument("--cpu",help="CPU override (e.g. x86_64, arm64, riscv64)")
    p.add_argument("--gpu-arch",default="generic",help="GPU ISA (requires published driver-qualified build)")
    p.add_argument("--version",help="Exact compiler version; default newest published")
    p.add_argument("--format",choices=("binary","gz","tar","tar.gz","zip"))
    p.add_argument("--prefix",help="Installation prefix; default user local directory")
    args=p.parse_args()
    try: install(args)
    except (ValueError,OSError,KeyError,TypeError,json.JSONDecodeError,zipfile.BadZipFile,tarfile.TarError) as error:
        print("noqeri-install: "+str(error),file=sys.stderr)
        sys.exit(2)

if __name__=="__main__":main()
