import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { greet } from '@/modules/greeting'

describe('greet()', () => {
  it('greets the recipient with the default exclamation mark', () => {
    assert.equal(greet('Ada'), 'Hello, Ada!')
  })

  it('appends custom punctuation when provided', () => {
    assert.equal(greet('Ada', { punctuation: '.' }), 'Hello, Ada.')
  })

  it('falls back to the default punctuation for an empty options object', () => {
    assert.equal(greet('Ada', {}), 'Hello, Ada!')
  })

  it('keeps an empty recipient literal instead of guessing a name', () => {
    assert.equal(greet(''), 'Hello, !')
  })

  it('does not trim or alter whitespace in the recipient', () => {
    assert.equal(greet('  Ada  '), 'Hello,   Ada  !')
  })
})
