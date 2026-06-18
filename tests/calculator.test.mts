import test from 'node:test'
import assert from 'node:assert/strict'

const calculator = await import('../lib/study-plans/calculator.ts')
const defaults = await import('../lib/study-plans/defaults.ts')

const { buildProposalSeed } = calculator
const { createBlankStudyPlan } = defaults

function calcPlan() {
  // Simulate an ephemeral calculator plan that already carries derived state we must strip.
  return {
    ...createBlankStudyPlan(),
    student: 'Novo Estudante',
    email: '',
    phone: '',
    studentLocation: 'onshore' as const,
    applicantType: 'Casal' as const,
    computed: { version: 1, currencyCode: 'AUD', grandTotalCents: 12345 } as any,
    options: [{ id: 'opt1', label: 'B', courses: [] }] as any,
    contactRef: { id: 'stale', fullName: 'Stale', email: null, phone: null },
  }
}

const contact = { id: 'c-123', fullName: 'Ada Lovelace', email: 'ada@example.com', phone: '+61 400 000 000' }

test('seeds student identity from the resolved contact', () => {
  const seed = buildProposalSeed(calcPlan(), contact)
  assert.equal(seed.student, 'Ada Lovelace')
  assert.equal(seed.email, 'ada@example.com')
  assert.equal(seed.phone, '+61 400 000 000')
  assert.deepEqual(seed.contactRef, { id: 'c-123', fullName: 'Ada Lovelace', email: 'ada@example.com', phone: '+61 400 000 000' })
})

test('empty email/phone on contact map to empty strings', () => {
  const seed = buildProposalSeed(calcPlan(), { id: 'c-9', fullName: 'No Contact', email: null, phone: null })
  assert.equal(seed.email, '')
  assert.equal(seed.phone, '')
})

test('strips stale derived fields (computed/options) and resets payments', () => {
  const seed = buildProposalSeed(calcPlan(), contact)
  assert.equal(seed.computed, undefined)
  assert.equal(seed.options, undefined)
  assert.deepEqual(seed.payments, [])
})

test('preserves the course mix, extra costs and student location/applicant type', () => {
  const plan = calcPlan()
  const seed = buildProposalSeed(plan, contact)
  assert.equal(seed.studentLocation, 'onshore')
  assert.equal(seed.applicantType, 'Casal')
  assert.deepEqual(seed.courses, plan.courses)
  assert.deepEqual(seed.extraCosts, plan.extraCosts)
})

test('is immutable — does not mutate the input plan', () => {
  const plan = calcPlan()
  const before = JSON.stringify(plan)
  buildProposalSeed(plan, contact)
  assert.equal(JSON.stringify(plan), before)
})
