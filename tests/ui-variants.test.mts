// tests/ui-variants.test.mts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buttonClass } from '../components/ui/variants.ts'

test('buttonClass maps primary to the fill class', () => {
  assert.equal(buttonClass('primary'), 'button-fill-primary-md')
})

test('buttonClass maps secondary to the outline class', () => {
  assert.equal(buttonClass('secondary'), 'button-outline-secondary-md')
})

test('buttonClass maps icon to the blank icon class', () => {
  assert.equal(buttonClass('icon'), 'button-blank-secondary-icon')
})

test('buttonClass defaults to secondary for unknown variant', () => {
  // @ts-expect-error testing runtime fallback
  assert.equal(buttonClass('nope'), 'button-outline-secondary-md')
})
