// tests/admissions-parse.test.mts — pure jsonb normalizers for the admissions seam.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDocuments, parseContacts, parseStreams } from '../lib/admissions/types.ts'

test('parseDocuments keeps valid items and filters unknown tags', () => {
  // Arrange
  const raw = [
    { label: 'Passport', tags: ['visa', 'bogus'] },
    { label: '  Award  ', tags: [], note: '  certified  ' },
  ]
  // Act
  const docs = parseDocuments(raw)
  // Assert
  assert.equal(docs.length, 2)
  assert.deepEqual(docs[0], { label: 'Passport', tags: ['visa'] })
  assert.deepEqual(docs[1], { label: 'Award', tags: [], note: 'certified' })
})

test('parseDocuments drops entries without a label and non-array input', () => {
  assert.deepEqual(parseDocuments([{ tags: ['visa'] }, { label: '   ' }, null, 'x']), [])
  assert.deepEqual(parseDocuments(null), [])
  assert.deepEqual(parseDocuments('nope'), [])
})

test('parseContacts keeps populated contacts and validates role', () => {
  // Arrange
  const raw = [
    { name: ' Ana ', role: 'admissions', email: ' a@x.com ', phone: ' 123 ' },
    { role: 'not-a-role', email: 'b@x.com' },
    { name: '', email: '', phone: '' },
  ]
  // Act
  const contacts = parseContacts(raw)
  // Assert — third entry is fully empty and dropped; second keeps email, drops invalid role
  assert.equal(contacts.length, 2)
  assert.deepEqual(contacts[0], { name: 'Ana', role: 'admissions', email: 'a@x.com', phone: '123' })
  assert.deepEqual(contacts[1], { email: 'b@x.com' })
})

test('parseStreams filters junk and dedupes', () => {
  assert.deepEqual(parseStreams(['english', 'vet', 'english', 'martian']), ['english', 'vet'])
  assert.deepEqual(parseStreams('english'), [])
  assert.deepEqual(parseStreams(undefined), [])
})
