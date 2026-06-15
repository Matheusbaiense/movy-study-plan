import test from 'node:test'
import assert from 'node:assert/strict'

const portfolio = await import('../lib/portfolio/types.ts')

// A price version row as returned by the DB / current_course_price RPC (integer cents).
function makeVersion(overrides = {}) {
  return {
    id: 'pv1',
    course_id: 'c1',
    org_id: 'org1',
    currency_code: 'AUD',
    tuition_in_cents: 640000,
    rate_per_week_in_cents: 29000,
    enrolment_fee_in_cents: 25000,
    material_fee_in_cents: 24000,
    has_material: true,
    scholarship_in_cents: 50000,
    deposit_weeks: 4,
    payment_parts: 4,
    payment_frequency: 'A cada 6 semanas',
    nationality: null,
    market_id: null,
    valid_from: '2026-01-01',
    valid_until: null,
    source_document_id: null,
    metadata: {},
    created_at: '2026-01-01T00:00:00Z',
    created_by: null,
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

test('priceVersionToSnapshot converts integer cents to float dollars at the border', () => {
  const snap = portfolio.priceVersionToSnapshot(makeVersion())
  assert.equal(snap.priceVersionId, 'pv1')
  assert.equal(snap.currencyCode, 'AUD')
  assert.equal(snap.tuition, 6400)
  assert.equal(snap.ratePerWeek, 290)
  assert.equal(snap.enrolmentFee, 250)
  assert.equal(snap.materialFee, 240)
  assert.equal(snap.scholarship, 500)
  assert.equal(snap.hasMaterial, true)
  assert.equal(snap.depositWeeks, 4)
  assert.equal(snap.paymentParts, 4)
  assert.equal(snap.validFrom, '2026-01-01')
  assert.equal(snap.validUntil, null)
})

test('buildStudyCourse maps an ELICOS snapshot onto a valid editor course (rate-driven)', () => {
  const snap = portfolio.priceVersionToSnapshot(makeVersion())
  const course = portfolio.buildStudyCourse(
    { type: 'elicos', name: 'General English', provider: 'Test College', timetable: 'Morning' },
    snap,
  )
  assert.equal(course.type, 'elicos')
  assert.equal(course.name, 'General English')
  assert.equal(course.provider, 'Test College')
  assert.equal(course.timetable, 'Morning')
  assert.equal(course.ratePerWeek, 290)
  assert.equal(course.enrolmentFee, 250)
  assert.equal(course.materialFee, 240)
  // Segments come from the createCourse default scaffold (valid, non-empty).
  assert.ok(Array.isArray(course.segments) && course.segments.length > 0)
})

test('buildStudyCourse maps a VET snapshot (tuition-driven)', () => {
  const snap = portfolio.priceVersionToSnapshot(makeVersion({ tuition_in_cents: 1200000, has_material: false }))
  const course = portfolio.buildStudyCourse({ type: 'vet', name: 'Diploma', provider: 'VET College' }, snap)
  assert.equal(course.type, 'vet')
  assert.equal(course.tuition, 12000)
  assert.equal(course.hasMaterial, false)
})

test('asCourseType narrows known types and falls back to elicos', () => {
  assert.equal(portfolio.asCourseType('vet'), 'vet')
  assert.equal(portfolio.asCourseType('he'), 'he')
  assert.equal(portfolio.asCourseType('elicos'), 'elicos')
  assert.equal(portfolio.asCourseType('bogus'), 'elicos')
})

// A pricing_rules row as stored in the DB (jsonb conditions/effect).
function makeRuleRow(overrides = {}) {
  return {
    id: 'r1',
    org_id: 'org1',
    scope: 'org',
    scope_id: null,
    conditions: { courseType: 'elicos', minWeeks: 24 },
    effect: { kind: 'discount_pct', pct: 10 },
    priority: 5,
    is_active: true,
    label: 'Promo longa',
    valid_from: null,
    valid_until: null,
    deleted_at: null,
    metadata: {},
    created_at: '2026-01-01T00:00:00Z',
    created_by: null,
    updated_at: '2026-01-01T00:00:00Z',
    updated_by: null,
    ...overrides,
  }
}

test('rowToPricingRule maps DB jsonb columns to the engine PricingRule shape', () => {
  const rule = portfolio.rowToPricingRule(makeRuleRow())
  assert.equal(rule.id, 'r1')
  assert.equal(rule.scope, 'org')
  assert.equal(rule.scopeId, null)
  assert.deepEqual(rule.when, { courseType: 'elicos', minWeeks: 24 })
  assert.deepEqual(rule.effect, { kind: 'discount_pct', pct: 10 })
  assert.equal(rule.priority, 5)
  assert.equal(rule.isActive, true)
})

test('rowToPricingRule falls back to org scope for an unknown scope', () => {
  assert.equal(portfolio.rowToPricingRule(makeRuleRow({ scope: 'galaxy' })).scope, 'org')
})

test('isRuleActiveOn respects disabled, soft-deleted, and the validity window', () => {
  const on = new Date('2026-06-15T00:00:00Z')
  assert.equal(portfolio.isRuleActiveOn(makeRuleRow(), on), true)
  assert.equal(portfolio.isRuleActiveOn(makeRuleRow({ is_active: false }), on), false)
  assert.equal(portfolio.isRuleActiveOn(makeRuleRow({ deleted_at: '2026-06-01T00:00:00Z' }), on), false)
  // Before the window opens.
  assert.equal(portfolio.isRuleActiveOn(makeRuleRow({ valid_from: '2026-07-01T00:00:00Z' }), on), false)
  // After the window closes.
  assert.equal(portfolio.isRuleActiveOn(makeRuleRow({ valid_until: '2026-06-01T00:00:00Z' }), on), false)
  // Inside the window.
  assert.equal(
    portfolio.isRuleActiveOn(makeRuleRow({ valid_from: '2026-06-01T00:00:00Z', valid_until: '2026-12-31T00:00:00Z' }), on),
    true,
  )
})

test('draftToInsert maps a camelCase draft to a snake_case insert payload', () => {
  const insert = portfolio.draftToInsert(
    'org9',
    {
      scope: 'institution',
      scopeId: 'inst1',
      when: { courseType: 'elicos' },
      effect: { kind: 'promo_rate_override', ratePerWeek: 250 },
      priority: 3,
      isActive: true,
      label: 'Promo',
      validFrom: '2026-06-01',
      validUntil: '2026-12-31',
    },
    'user1',
  )
  assert.equal(insert.org_id, 'org9')
  assert.equal(insert.scope, 'institution')
  assert.equal(insert.scope_id, 'inst1')
  assert.deepEqual(insert.conditions, { courseType: 'elicos' })
  assert.deepEqual(insert.effect, { kind: 'promo_rate_override', ratePerWeek: 250 })
  assert.equal(insert.priority, 3)
  assert.equal(insert.is_active, true)
  assert.equal(insert.valid_from, '2026-06-01')
  assert.equal(insert.created_by, 'user1')
})

test('draftToUpdate includes only provided fields', () => {
  const update = portfolio.draftToUpdate({ priority: 9 }, 'user2')
  assert.equal(update.priority, 9)
  assert.equal(update.updated_by, 'user2')
  assert.equal('scope' in update, false)
  assert.equal('conditions' in update, false)
})
