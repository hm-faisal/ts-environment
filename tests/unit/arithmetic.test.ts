import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ArithmeticOps } from '@/utils/arithmetic'

describe('ArithmeticOps', () => {
  const ops = new ArithmeticOps()

  describe('add()', () => {
    it('adds positive numbers', () => {
      assert.equal(ops.add(2, 3), 5)
    })
    it('handles negatives and zero', () => {
      assert.equal(ops.add(-2, 2), 0)
      assert.equal(ops.add(0, 0), 0)
    })
  })

  describe('subtract()', () => {
    it('subtracts the second operand from the first', () => {
      assert.equal(ops.subtract(5, 3), 2)
    })
    it('handles negative results', () => {
      assert.equal(ops.subtract(3, 5), -2)
    })
  })

  describe('multiply()', () => {
    it('multiplies two numbers', () => {
      assert.equal(ops.multiply(4, 3), 12)
    })
    it('returns zero when either operand is zero', () => {
      assert.equal(ops.multiply(0, 7), 0)
      assert.equal(ops.multiply(7, 0), 0)
    })
  })

  describe('divide()', () => {
    it('divides the first operand by the second', () => {
      assert.equal(ops.divide(10, 4), 2.5)
    })
    it('yields Infinity for division by zero (JS semantics, not an error)', () => {
      assert.equal(ops.divide(1, 0), Number.POSITIVE_INFINITY)
      assert.equal(ops.divide(-1, 0), Number.NEGATIVE_INFINITY)
    })
  })
})
