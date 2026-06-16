// tests/ui-tabs-logic.test.mts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isTabActive } from '../components/ui/tabs-logic.ts'

test('isTabActive is true on exact match', () => {
  assert.equal(isTabActive('/en/settings/users', '/en/settings/users'), true)
})

test('isTabActive is true when pathname is a sub-route of the tab', () => {
  assert.equal(isTabActive('/en/settings/users/42', '/en/settings/users'), true)
})

test('isTabActive is false for a sibling tab', () => {
  assert.equal(isTabActive('/en/settings/users', '/en/settings/presets'), false)
})

test('isTabActive does not match on partial segment', () => {
  assert.equal(isTabActive('/en/settings/users-archive', '/en/settings/users'), false)
})
