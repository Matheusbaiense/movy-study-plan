import test from 'node:test'
import assert from 'node:assert/strict'

// SPLIT 2 — contacts seam + proposal status enum.
// contacts.ts has only type-only imports at runtime, so the pure normalizers
// load cleanly under `node --test` type-stripping.
const contacts = await import('../lib/crm/contacts.ts')
const supabaseTypes = await import('../types/supabase.ts')

test('normalizeEmail lowercases, trims, and nulls empties', () => {
  assert.equal(contacts.normalizeEmail('  Foo@Bar.COM '), 'foo@bar.com')
  assert.equal(contacts.normalizeEmail(''), null)
  assert.equal(contacts.normalizeEmail('   '), null)
  assert.equal(contacts.normalizeEmail(null), null)
  assert.equal(contacts.normalizeEmail(undefined), null)
})

test('normalizePhone trims and nulls empties (no lowercasing)', () => {
  assert.equal(contacts.normalizePhone('  +61 400 000 000 '), '+61 400 000 000')
  assert.equal(contacts.normalizePhone(''), null)
  assert.equal(contacts.normalizePhone('   '), null)
  assert.equal(contacts.normalizePhone(null), null)
  assert.equal(contacts.normalizePhone(undefined), null)
})

test('study_plan_status enum constant carries the SPLIT 2 statuses', () => {
  const statuses = supabaseTypes.Constants.public.Enums.study_plan_status
  for (const required of [
    'draft',
    'sent',
    'accepted',
    'archived',
    'ready_review',
    'approved_internal',
    'viewed',
    'negotiating',
    'rejected',
    'expired',
  ]) {
    assert.ok(statuses.includes(required), `missing status: ${required}`)
  }
})
