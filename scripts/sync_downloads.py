#!/usr/bin/env python3
"""Synchronize actual Noqeri GitHub Releases and generate a static, JS-free download page.

No binary URL is published unless GitHub reports an existing, released asset
with the exact expected size and the synchronizer verifies its SHA-256 bytes.
"""
from __future__ import annotations
import argparse
import hashlib
import html
import json
import re
import sys
import urllib.request
from pathlib import Path

OWNER,REPO="EMN90909","Noqeri"
BASE=f"https://github.com/{OWNER}/{REPO}"
API=f"https://api.github.com/repos/{OWNER}/{REPO}"
VERSION=re.compile(r"^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[A-Za-z0-9.-]+)?$")
SHA256=re.compile(r"^[a-f0-9]{64}$")
SAFE_FILE=re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,127}$")
OS={"windows":"Windows","macos":"macOS","linux":"Linux","android":"Android","freebsd":"FreeBSD","openbsd":"OpenBSD"}
CPU={"x86_64":"x86-64 / AMD64","arm64":"ARM64 / AArch64","armv7":"ARMv7","x86":"x86 32-bit","riscv64":"RISC-V 64","ppc64le":"PowerPC LE","s390x":"IBM Z"}
FORMAT={"binary":"Executable","gz":"Gzip binary","tar":"TAR","tar.gz":"TAR.GZ","zip":"ZIP"}

def fail(msg):
    raise ValueError(msg)

def trusted(url,tag,name):
    return url==f"{BASE}/releases/download/{tag}/{name}"

def download_json(url):
    if not url.startswith("https://"): fail("HTTPS required")
    req=urllib.request.Request(url,headers={"Accept":"application/vnd.github+json","User-Agent":"Noqeri-registry-sync"})
    with urllib.request.urlopen(req,timeout=30) as response:
        if response.status!=200: fail("GitHub did not return HTTP 200")
        raw=response.read(4*1024*1024+1)
    if len(raw)>4*1024*1024: fail("release metadata exceeds 4 MiB")
    return json.loads(raw)

def hash_remote(url,size,expected):
    digest=hashlib.sha256()
    consumed=0
    req=urllib.request.Request(url,headers={"User-Agent":"Noqeri-registry-sync"})
    with urllib.request.urlopen(req,timeout=90) as response:
        while True:
            chunk=response.read(1024*1024)
            if not chunk: break
            consumed+=len(chunk)
            if consumed>size: fail("remote asset exceeds declared size")
            digest.update(chunk)
    if consumed!=size or digest.hexdigest()!=expected:
        fail("published asset bytes do not match release SHA-256")

def verify_release(release,manifest,verify_bytes=True):
    version=manifest.get("version")
    if not isinstance(version,str) or not VERSION.fullmatch(version): fail("invalid version")
    tag="v"+version
    if release.get("tag_name")!=tag or release.get("draft") or not release.get("published_at"):
        fail("no published GitHub Release for version")
    if manifest.get("schema")!=1 or manifest.get("product")!="noqeri-compiler" or manifest.get("channel") not in ("preview","stable"):
        fail("unsupported release-manifest schema")
    if not re.fullmatch(r"[0-9a-f]{40}",manifest.get("source_commit","")): fail("source commit missing")
    if release.get("prerelease") and manifest["channel"]=="stable": fail("pre-release cannot be stable")
    if release.get("html_url")!=f"{BASE}/releases/tag/{tag}": fail("untrusted release URL")
    records=release.get("assets",[])
    assets={a.get("name"):a for a in records if isinstance(a,dict)}
    if len(assets)!=len(records) or "release-manifest.json" not in assets: fail("duplicate/missing official assets")
    seen=set()
    targets=[]
    for target in manifest.get("targets",[]):
        os_name,cpu=target.get("os"),target.get("cpu")
        if os_name not in OS and not re.fullmatch(r"custom-[a-z0-9-]{1,32}",os_name or ""):
            fail("unrecognized platform")
        if cpu not in CPU: fail("unrecognized CPU")
        if target.get("qualification") not in ("executed","build-only"): fail("target qualification missing")
        if manifest["channel"]=="stable" and target["qualification"]!="executed": fail("unexecuted stable target")
        gpu=target.get("gpu")
        if not isinstance(gpu,dict) or not gpu.get("backend") or not gpu.get("architecture"):
            fail("GPU capability metadata missing")
        if gpu["architecture"]!="generic" and not gpu.get("hardware_qualified"): fail("GPU-driver qualification missing")
        key=(os_name,cpu,gpu["architecture"])
        if key in seen: fail("duplicate CPU/GPU target")
        seen.add(key)
        listed=[]
        files=set()
        for item in target.get("assets",[]):
            filename,sha=item.get("filename"),item.get("sha256")
            if not isinstance(filename,str) or not SAFE_FILE.fullmatch(filename): fail("unsafe filename")
            if not filename.startswith(f"noqeri-v{version}-{os_name}-{cpu}"): fail("mislabelled binary target")
            if filename in files: fail("duplicate target asset")
            files.add(filename)
            if item.get("format") not in FORMAT or not isinstance(sha,str) or not SHA256.fullmatch(sha):
                fail("invalid checksum or archive format")
            remote=assets.get(filename)
            if not remote or remote.get("size")!=item.get("bytes"): fail("asset missing or wrong length: "+filename)
            url=remote.get("browser_download_url")
            if not trusted(url,tag,filename): fail("untrusted binary URL")
            if remote.get("digest") and remote["digest"]!="sha256:"+sha: fail("GitHub API digest disagrees")
            if verify_bytes: hash_remote(url,item["bytes"],sha)
            listed.append({"filename":filename,"format":item["format"],"sha256":sha,"bytes":item["bytes"],"url":url})
        if not listed: fail("release target has no binaries")
        targets.append({"os":os_name,"cpu":cpu,"qualification":target["qualification"],"gpu":gpu,"assets":listed})
    if not targets: fail("no downloadable build records")
    return {"schema":1,"version":version,"channel":manifest["channel"],
            "source_commit":manifest["source_commit"],"published_at":release["published_at"],
            "release_url":release["html_url"],"targets":targets}

def read_catalog(release_dir):
    releases=[]
    for path in sorted(release_dir.glob("*.json")):
        data=json.loads(path.read_text(encoding="utf-8"))
        version=data.get("version")
        if not isinstance(version,str) or not VERSION.fullmatch(version) or path.name!=version+".json":
            fail("incorrect release catalog filename/version")
        if data.get("schema")!=1 or not data.get("targets"): fail("invalid published release")
        for target in data["targets"]:
            for asset in target.get("assets",[]):
                if not trusted(asset.get("url"),"v"+version,asset.get("filename")):
                    fail("untrusted catalog asset")
                if not isinstance(asset.get("sha256"),str) or not SHA256.fullmatch(asset["sha256"]):
                    fail("incorrect catalog SHA")
        releases.append(data)
    releases.sort(key=lambda r:tuple(int(x) for x in r["version"].split("-")[0].split(".")),reverse=True)
    return releases

def page(releases):
    esc=lambda s:html.escape(str(s),quote=True)
    parts=['''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Download Noqeri binaries for Linux, Windows, macOS, Android and BSD.">
<title>Noqeri Downloads | Native compiler</title>
<style>
:root{color-scheme:dark;--bg:#090e17;--surface:#111d2a;--line:#374554;--ink:#f0f6ff;--muted:#b9cbdc;--a:#92f0d0}
*{box-sizing:border-box}body{margin:0;font:16px/1.6 system-ui,Segoe UI,sans-serif;background:radial-gradient(ellipse at 75% -15%,#204453,transparent 55%),var(--bg);color:var(--ink)}
a{color:var(--a)}a:focus-visible,summary:focus-visible{outline:3px solid var(--a);outline-offset:4px}
header,main,footer{max-width:1120px;margin:auto;padding:24px}
nav{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;border-bottom:1px solid var(--line)}
.brand{font-weight:800;letter-spacing:.07em}h1{font-size:clamp(2.3rem,6vw,4.4rem);letter-spacing:-.055em;line-height:1.07;margin:12px 0;max-width:780px}h2{font-size:1.75rem;letter-spacing:-.03em}
.hero{padding:54px 0 34px}.eyebrow{color:var(--a);font-size:.8rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase}
p{color:var(--muted);max-width:800px}section{margin-bottom:48px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,310px),1fr));gap:18px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:22px}.card h3{margin:0}.meta{color:var(--muted);font-size:.9rem}
.pill{border:1px solid var(--line);border-radius:50px;padding:2px 9px;color:var(--muted);font-size:.78rem;display:inline-block;margin-top:9px}
details{margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}summary{cursor:pointer;font-weight:650}
.asset{padding:12px 0;border-bottom:1px dashed var(--line)}small{color:var(--muted);display:block;overflow-wrap:anywhere}
.hash{font:11px/1.6 ui-monospace,monospace;overflow-wrap:anywhere;color:#cad8e7}
.empty{background:#132130;border:1px dashed var(--line);padding:26px;border-radius:18px}
.notes{background:#12212e;border-left:3px solid var(--a);padding:22px;border-radius:8px}
code{background:#233543;padding:2px 5px;border-radius:4px}footer{color:var(--muted);border-top:1px solid var(--line);font-size:.85rem}
</style></head><body><header><nav><span class="brand">NOQERI / DOWNLOADS</span><a href="https://github.com/EMN90909/Noqeri">View source</a></nav></header>
<main><div class="hero"><span class="eyebrow">Compiler distribution</span><h1>One language. Your machine.</h1><p>Choose your operating system, CPU and file format. Only genuinely published assets with verified SHA-256 hashes appear below. GPU-driver support is qualified separately.</p></div>
<section id="releases"><h2>Published compiler builds</h2>''']
    if not releases:
        parts.append('''<div class="empty"><h3>Binary downloads not yet published</h3><p>No public release assets are available to verify. Source builds and release preparation are supported; actual download links will appear when CI artifacts are published.</p><a href="https://github.com/EMN90909/Noqeri">Get source and build instructions</a></div>''')
    for release in releases:
        parts.append(f'<h3>v{esc(release["version"])} <span class="pill">{esc(release["channel"])}</span></h3><div class="grid">')
        for target in release["targets"]:
            gpu=target["gpu"]
            parts.append(f'<article class="card"><h3>{esc(OS.get(target["os"],target["os"]))}</h3><div class="meta">{esc(CPU.get(target["cpu"],target["cpu"]))}</div><span class="pill">{esc(target["qualification"])}</span> <span class="pill">GPU: {esc(gpu["backend"])} · {esc(gpu["architecture"])}</span><details><summary>Download formats ({len(target["assets"])})</summary>')
            for a in target["assets"]:
                parts.append(f'<div class="asset"><a href="{esc(a["url"])}" rel="noopener noreferrer">{esc(FORMAT[a["format"]])}</a><small>{esc(a["filename"])} · {a["bytes"]/1048576:.2f} MiB</small><span class="hash">SHA-256: {esc(a["sha256"])}</span></div>')
            parts.append('</details></article>')
        parts.append('</div>')
    parts.append('</section><section id="platforms"><h2>Supported distribution targets</h2><div class="grid">')
    for os_name,label in OS.items():
        present=any(t["os"]==os_name for r in releases for t in r["targets"])
        parts.append(f'<div class="card"><h3>{esc(label)}</h3><p>{"Published build listed above" if present else "No qualified binary published yet"}</p></div>')
    parts.append('''<div class="card"><h3>Custom OS</h3><p>Build through a CMake toolchain file for your kernel/ABI. Runtime support must be separately verified.</p></div></div></section>
<section id="installation"><h2>Installation</h2><div class="notes">
<p><strong>Linux, BSD, macOS, Android CLI:</strong> run <code>tar -xzf FILE.tar.gz</code>, then <code>./noqeri-vVERSION-OS-CPU/bin/noqeri --version</code>. Android packages are NDK CLI executables, not Android APKs.</p>
<p><strong>Windows:</strong> use <code>Expand-Archive FILE.zip</code>, then <code>bin/noqeri.exe --version</code>.</p>
<p>Verify <code>sha256sum FILE</code> (PowerShell: <code>Get-FileHash FILE -Algorithm SHA256</code>) against the checksum above before executing. A build-only artifact is not guaranteed to run on your device.</p>
<p>Generic WGSL shader emission does not imply NVIDIA CUDA, AMD ROCm, Intel Arc, Apple Metal, or GPU-driver validation. GPU-specific binaries are listed only with actual qualification evidence.</p>
</div></section></main><footer>Official Noqeri Registry · <a href="https://github.com/EMN90909/noqeri-registry">Repository</a> · Preview artifacts are not production guarantees.</footer></body></html>''')
    return "\n".join(parts)+"\n"

def main():
    p=argparse.ArgumentParser(description=__doc__)
    sub=p.add_subparsers(dest="command",required=True)
    sync=sub.add_parser("sync")
    sync.add_argument("--version",required=True)
    sync.add_argument("--releases-dir",default="distribution/releases")
    web=sub.add_parser("build-site")
    web.add_argument("--releases-dir",default="distribution/releases")
    web.add_argument("--output",default="downloads/index.html")
    web.add_argument("--json-output",default="downloads/releases.json")
    args=p.parse_args()
    try:
        if args.command=="sync":
            if not VERSION.fullmatch(args.version): fail("invalid version")
            release=download_json(API+"/releases/tags/v"+args.version)
            record=next((a for a in release.get("assets",[]) if a.get("name")=="release-manifest.json"),None)
            if not record or not trusted(record.get("browser_download_url"),"v"+args.version,"release-manifest.json"):
                fail("public release manifest unavailable")
            manifest=download_json(record["browser_download_url"])
            result=verify_release(release,manifest,verify_bytes=True)
            dest=Path(args.releases_dir)/(args.version+".json")
            dest.parent.mkdir(parents=True,exist_ok=True)
            if dest.exists(): fail("published release metadata is immutable; refusing to overwrite")
            dest.write_text(json.dumps(result,indent=2,sort_keys=True)+"\n",encoding="utf-8")
            print(f"Verified and imported v{args.version} ({len(result['targets'])} targets)")
        else:
            releases=read_catalog(Path(args.releases_dir))
            output=Path(args.output)
            output.parent.mkdir(parents=True,exist_ok=True)
            output.write_text(page(releases),encoding="utf-8")
            index=Path(args.json_output)
            index.parent.mkdir(parents=True,exist_ok=True)
            index.write_text(json.dumps({"schema":1,"releases":releases},indent=2,sort_keys=True)+"\n",encoding="utf-8")
            print(f"Generated static Noqeri download catalog: {len(releases)} published releases")
    except (ValueError,KeyError,TypeError,OSError,json.JSONDecodeError) as error:
        print(f"sync-downloads: {error}",file=sys.stderr)
        sys.exit(2)

if __name__=="__main__": main()
