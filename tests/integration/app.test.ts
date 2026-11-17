import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it, type Mock, mock } from 'node:test'
import { run } from '@/app'
import { APP_NAME } from '@/config/runtime'

describe('run() (integration)', () => {
  let lines: string[]
  let logMock: Mock<(...args: unknown[]) => void>

  // Setup/teardown per test: capture console output, restore afterwards so
  // tests never leak a patched console into each other.
  beforeEach(() => {
    lines = []
    logMock = mock.method(console, 'log', (...args: unknown[]) => {
      lines.push(args.join(' '))
    })
  })

  afterEach(() => {
    logMock.mock.restore()
  })

  it('resolves asynchronously with the greeting message', async () => {
    const message = await run()
    assert.equal(message, `Hello, ${APP_NAME}!`)
  })

  it('logs the greeting and the runtime info banner', async () => {
    await run()

    assert.ok(lines.some((line) => line.startsWith(`Hello, ${APP_NAME}!`)))
    assert.ok(
      lines.some((line) => line.includes(process.versions.node)),
      'runtime info line should include the Node.js version'
    )
  })

  it('writes exactly two lines to the console', async () => {
    await run()
    assert.equal(lines.length, 2)
  })

  it('runs repeatedly with identical results (repeatable, no shared state)', async () => {
    const first = await run()
    const second = await run()
    assert.equal(first, second)
  })
})
