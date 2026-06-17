// tests/ui-skeleton-logic.test.mts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { skeletonRows } from '../components/ui/skeleton-logic.ts'

test('skeletonRows returns an array of the requested length', () => {
  assert.deepEqual(skeletonRows(3), [0, 1, 2])
})

test('skeletonRows clamps to at least 1', () => {
  assert.deepEqual(skeletonRows(0), [0])
})

test('skeletonRows clamps negatives to 1', () => {
  assert.deepEqual(skeletonRows(-5), [0])
})
