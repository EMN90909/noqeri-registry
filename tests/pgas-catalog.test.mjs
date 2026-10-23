import test from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

test("PGAS preview has canonical sources and is not declared production-ready", async () => {
  const index = JSON.parse(await readFile(new URL("../registry/index.json", import.meta.url), "utf8"))
  const record = index.packages.find(x => x.namespace === "noqeri" && x.name === "pgas")
  assert.ok(record, "noqeri/pgas missing from registry catalog")
  const version = record.versions.find(x => x.version === "0.1.0")
  assert.ok(version)
  assert.equal(version.experimental, true)
  assert.equal(version.quality, "experimental")
  assert.equal(version.path, "packages/noqeri/pgas/0.1.0")
  const manifest = await readFile(new URL("../packages/noqeri/pgas/0.1.0/package.noqeri", import.meta.url), "utf8")
  const source = await readFile(new URL("../packages/noqeri/pgas/0.1.0/src/pgas.noqeri", import.meta.url), "utf8")
  assert.match(manifest, /entry: "src\/pgas.noqeri"/)
  assert.match(source, /module noqeri.pgas/)
  assert.match(source, /pgas_locate/)
  assert.match(source, /pgas_cas_i64/)
  assert.match(source, /pgas_sync/)
})
