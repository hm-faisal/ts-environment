import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { APP_NAME, nodeMajorVersion, runtimeInfo } from '@/config/runtime'

describe('nodeMajorVersion()', () => {
  it('returns the leading segment of the running Node.js version', () => {
    const expected = process.versions.node.split('.')[0]
    assert.equal(nodeMajorVersion(), expected)
  })

  it('returns only numeric digits', () => {
    assert.match(nodeMajorVersion(), /^\d+$/)
  })
})

describe('runtimeInfo()', () => {
  it('mentions the exact running Node.js version', () => {
    assert.ok(runtimeInfo().includes(process.versions.node))
  })

  it('mentions the resolved major version', () => {
    assert.ok(runtimeInfo().includes(`major=${nodeMajorVersion()}`))
  })
})

describe('APP_NAME', () => {
  it('is a non-empty string', () => {
    assert.equal(typeof APP_NAME, 'string')
    assert.ok(APP_NAME.length > 0)
  })
})
