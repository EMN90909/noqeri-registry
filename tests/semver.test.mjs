import test from 'node:test'
import assert from 'node:assert/strict'
import {compareSemver,VALID_VERSION} from '../runtime/semver.mjs'
test('numeric SemVer ordering and prerelease precedence',()=>{
 assert.ok(compareSemver('1.10.0','1.9.0')>0)
 assert.ok(compareSemver('1.0.0','1.0.0-rc.3')>0)
 assert.ok(compareSemver('1.0.0-rc.10','1.0.0-rc.2')>0)
 assert.equal(compareSemver('1.0.0+build.3','1.0.0+build.2'),0)
 assert.equal(VALID_VERSION.test('1.2.3'),true)
 assert.equal(VALID_VERSION.test('../x'),false)
 assert.ok(compareSemver('1.0.0-foo-bar.2','1.0.0-foo-bar.1')>0)
 assert.throws(()=>compareSemver('1.0.0-01','1.0.0'),/leading zero/)
})
