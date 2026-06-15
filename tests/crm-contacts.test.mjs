import test from 'node:test'
import assert from 'node:assert/strict'

const crm = await import('../lib/crm/contacts.ts')

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
