// tests/hr-calculations.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'

const calc = await import('../lib/hr/calculations.ts')

// ─── detectDayType ───────────────────────────────────────────────────────────

test('detectDayType: returns weekday for a Monday', () => {
  const result = calc.detectDayType(new Date('2026-06-15'), []) // Monday
  assert.equal(result, 'weekday')
})

test('detectDayType: returns saturday for Saturday', () => {
  const result = calc.detectDayType(new Date('2026-06-13'), []) // Saturday
  assert.equal(result, 'saturday')
})

test('detectDayType: returns sunday for Sunday', () => {
  const result = calc.detectDayType(new Date('2026-06-14'), []) // Sunday
  assert.equal(result, 'sunday')
})

test('detectDayType: returns public_holiday when date is in list', () => {
  const result = calc.detectDayType(new Date('2026-01-26'), ['2026-01-26']) // Australia Day
  assert.equal(result, 'public_holiday')
})

// ─── calculateHours ──────────────────────────────────────────────────────────

test('calculateHours: 2 hours exactly', () => {
  const clockIn = new Date('2026-06-15T09:00:00Z')
  const clockOut = new Date('2026-06-15T11:00:00Z')
  assert.equal(calc.calculateHours(clockIn, clockOut), 2)
})

test('calculateHours: 7.5 hours', () => {
  const clockIn = new Date('2026-06-15T09:00:00Z')
  const clockOut = new Date('2026-06-15T16:30:00Z')
  assert.equal(calc.calculateHours(clockIn, clockOut), 7.5)
})

test('calculateHours: rounds to 2 decimal places', () => {
  const clockIn = new Date('2026-06-15T09:00:00Z')
  const clockOut = new Date('2026-06-15T10:00:20Z') // 1 hour 20 seconds
  assert.equal(calc.calculateHours(clockIn, clockOut), 1.01)
})

// ─── getMultiplier ────────────────────────────────────────────────────────────

const makeRule = (dayType, multiplier, from = '2026-01-01', until = null) => ({
  id: 'r1', org_id: 'o1', name: 'test', day_type: dayType,
  multiplier, applies_from: from, applies_until: until,
  metadata: {}, created_at: '', updated_at: '',
})

test('getMultiplier: returns 1.0 when no rules exist', () => {
  assert.equal(calc.getMultiplier('weekday', [], '2026-06-15'), 1.0)
})

test('getMultiplier: returns rule multiplier for matching day_type', () => {
  const rules = [makeRule('saturday', 1.5)]
  assert.equal(calc.getMultiplier('saturday', rules, '2026-06-14'), 1.5)
})

test('getMultiplier: ignores rule if date is before applies_from', () => {
  const rules = [makeRule('saturday', 1.5, '2026-07-01')]
  assert.equal(calc.getMultiplier('saturday', rules, '2026-06-14'), 1.0)
})

test('getMultiplier: ignores rule if date is after applies_until', () => {
  const rules = [makeRule('saturday', 1.5, '2026-01-01', '2026-06-01')]
  assert.equal(calc.getMultiplier('saturday', rules, '2026-06-14'), 1.0)
})

test('getMultiplier: returns highest multiplier when multiple rules match', () => {
  const rules = [makeRule('saturday', 1.5), makeRule('saturday', 2.0)]
  assert.equal(calc.getMultiplier('saturday', rules, '2026-06-14'), 2.0)
})

// ─── calculateLineItemCents ───────────────────────────────────────────────────

test('calculateLineItemCents: 8 hours at $25/hr weekday = 20000 cents', () => {
  assert.equal(calc.calculateLineItemCents(8, 2500, 1.0), 20000)
})

test('calculateLineItemCents: 4 hours at $30/hr saturday (1.5x) = 18000 cents', () => {
  assert.equal(calc.calculateLineItemCents(4, 3000, 1.5), 18000)
})

test('calculateLineItemCents: rounds to nearest cent', () => {
  // 1.01 hours at $25/hr = 1.01 * 2500 = 2525 cents
  assert.equal(calc.calculateLineItemCents(1.01, 2500, 1.0), 2525)
})

// ─── computeTotalCents ────────────────────────────────────────────────────────

test('computeTotalCents: sums an array of cents values', () => {
  assert.equal(calc.computeTotalCents([20000, 18000, 2525]), 40525)
})

test('computeTotalCents: returns 0 for empty array', () => {
  assert.equal(calc.computeTotalCents([]), 0)
})
