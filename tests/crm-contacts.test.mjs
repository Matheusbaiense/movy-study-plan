import test from 'node:test'
import assert from 'node:assert/strict'

// contacts.ts has only type-only imports at runtime, so the pure normalizers
// load cleanly under `node --test` type-stripping.
const crm = await import('../lib/crm/contacts.ts')
const supabaseTypes = await import('../types/supabase.ts')

// --- SPLIT 2: contacts seam + proposal status enum -----------------------------

test('normalizeEmail lowercases, trims, and nulls empties', () => {
  assert.equal(crm.normalizeEmail('  Foo@Bar.COM '), 'foo@bar.com')
  assert.equal(crm.normalizeEmail(''), null)
  assert.equal(crm.normalizeEmail('   '), null)
  assert.equal(crm.normalizeEmail(null), null)
  assert.equal(crm.normalizeEmail(undefined), null)
})

test('normalizePhone trims and nulls empties (no lowercasing)', () => {
  assert.equal(crm.normalizePhone('  +61 400 000 000 '), '+61 400 000 000')
  assert.equal(crm.normalizePhone(''), null)
  assert.equal(crm.normalizePhone('   '), null)
  assert.equal(crm.normalizePhone(null), null)
  assert.equal(crm.normalizePhone(undefined), null)
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

// --- Task 1: woofed-shaped lead custom-attribute helpers ------------------------

test('CONTACT_ATTR exposes the woofed-shaped keys', () => {
  assert.equal(crm.CONTACT_ATTR.NATIONALITY, 'nationality')
  assert.equal(crm.CONTACT_ATTR.LEAD_SOURCE, 'lead_source')
  assert.equal(crm.CONTACT_ATTR.PREFERRED_LANGUAGE, 'preferred_language')
})

test('getContactNationality reads custom_attributes.nationality (or null)', () => {
  assert.equal(crm.getContactNationality({ custom_attributes: { nationality: 'BR' } }), 'BR')
  assert.equal(crm.getContactNationality({ custom_attributes: {} }), null)
  assert.equal(crm.getContactNationality({ custom_attributes: null }), null)
})

test('buildContactAttributes normalizes, uppercases nationality, merges base, drops empty', () => {
  const out = crm.buildContactAttributes(
    { nationality: 'br', leadSource: ' Instagram ', preferredLanguage: '' },
    { existing: 'keep' },
  )
  assert.deepEqual(out, { existing: 'keep', nationality: 'BR', lead_source: 'Instagram' })
})

test('buildContactAttributes removes a key when set to empty', () => {
  const out = crm.buildContactAttributes({ nationality: '' }, { nationality: 'BR' })
  assert.equal('nationality' in out, false)
})
