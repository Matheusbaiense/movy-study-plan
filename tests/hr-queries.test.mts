/**
 * Tests for HR business-critical calculation functions.
 * lib/hr/queries.ts is DB-bound and requires integration tests (see CI with Supabase local stack).
 * lib/hr/calculations.ts contains pure functions that are directly testable and power invoice generation.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  detectDayType,
  calculateHours,
  getMultiplier,
  calculateLineItemCents,
  computeTotalCents,
  formatAUD,
  formatDateAU,
} from '../lib/hr/calculations.ts'

// ── detectDayType ─────────────────────────────────────────────────────────────

describe('detectDayType', () => {
  it('returns weekday for a Monday', () => {
    const monday = new Date('2025-06-09T12:00:00Z') // known Monday
    assert.equal(detectDayType(monday, []), 'weekday')
  })

  it('returns saturday for Saturday', () => {
    const sat = new Date('2025-06-07T12:00:00Z') // known Saturday
    assert.equal(detectDayType(sat, []), 'saturday')
  })

  it('returns sunday for Sunday', () => {
    const sun = new Date('2025-06-08T12:00:00Z') // known Sunday
    assert.equal(detectDayType(sun, []), 'sunday')
  })

  it('returns public_holiday when date matches holiday list', () => {
    const date = new Date('2025-12-25T12:00:00Z')
    assert.equal(detectDayType(date, ['2025-12-25']), 'public_holiday')
  })

  it('public_holiday takes priority over Saturday', () => {
    // Find a Saturday and mark it as holiday
    const sat = new Date('2025-06-07T12:00:00Z')
    assert.equal(detectDayType(sat, ['2025-06-07']), 'public_holiday')
  })
})

// ── calculateHours ────────────────────────────────────────────────────────────

describe('calculateHours', () => {
  it('calculates 8 hours correctly', () => {
    const inn = new Date('2025-06-09T09:00:00Z')
    const out = new Date('2025-06-09T17:00:00Z')
    assert.equal(calculateHours(inn, out), 8)
  })

  it('calculates fractional hours (30 min = 0.5)', () => {
    const inn = new Date('2025-06-09T09:00:00Z')
    const out = new Date('2025-06-09T09:30:00Z')
    assert.equal(calculateHours(inn, out), 0.5)
  })

  it('rounds to 2 decimal places', () => {
    const inn = new Date('2025-06-09T09:00:00Z')
    const out = new Date('2025-06-09T09:20:00Z') // 20 min = 0.333... h
    const h = calculateHours(inn, out)
    assert.equal(h, 0.33)
  })

  it('returns 0 for same time', () => {
    const t = new Date('2025-06-09T09:00:00Z')
    assert.equal(calculateHours(t, t), 0)
  })
})

// ── getMultiplier ─────────────────────────────────────────────────────────────

const makeRule = (overrides) => ({
  id: 'r1', org_id: 'org-1', day_type: 'weekday',
  multiplier: 1.5, applies_from: '2020-01-01', applies_until: null,
  created_at: '2020-01-01', updated_at: null,
  ...overrides,
})

describe('getMultiplier', () => {
  it('returns 1.0 when no rules match', () => {
    assert.equal(getMultiplier('saturday', [], '2025-06-07'), 1.0)
  })

  it('returns multiplier when day_type matches', () => {
    const rules = [makeRule({ day_type: 'saturday', multiplier: 1.5 })]
    assert.equal(getMultiplier('saturday', rules, '2025-06-07'), 1.5)
  })

  it('ignores rules for a different day_type', () => {
    const rules = [makeRule({ day_type: 'sunday', multiplier: 2.0 })]
    assert.equal(getMultiplier('saturday', rules, '2025-06-07'), 1.0)
  })

  it('ignores rules not yet in effect', () => {
    const rules = [makeRule({ day_type: 'saturday', multiplier: 1.5, applies_from: '2030-01-01' })]
    assert.equal(getMultiplier('saturday', rules, '2025-06-07'), 1.0)
  })

  it('ignores expired rules', () => {
    const rules = [makeRule({ day_type: 'saturday', multiplier: 1.5, applies_until: '2020-12-31' })]
    assert.equal(getMultiplier('saturday', rules, '2025-06-07'), 1.0)
  })

  it('picks the highest multiplier when multiple rules match', () => {
    const rules = [
      makeRule({ day_type: 'public_holiday', multiplier: 2.0 }),
      makeRule({ day_type: 'public_holiday', multiplier: 2.5 }),
    ]
    assert.equal(getMultiplier('public_holiday', rules, '2025-12-25'), 2.5)
  })
})

// ── calculateLineItemCents ────────────────────────────────────────────────────

describe('calculateLineItemCents', () => {
  it('calculates 8h at $50/h = $400 = 40000 cents', () => {
    assert.equal(calculateLineItemCents(8, 5000, 1.0), 40000)
  })

  it('applies 1.5x multiplier correctly', () => {
    // 8h × 5000c × 1.5 = 60000c
    assert.equal(calculateLineItemCents(8, 5000, 1.5), 60000)
  })

  it('rounds to nearest cent', () => {
    // 1h × 3333c × 1 = 3333 (exact)
    assert.equal(calculateLineItemCents(1, 3333, 1), 3333)
  })

  it('returns 0 for 0 hours', () => {
    assert.equal(calculateLineItemCents(0, 5000, 1.5), 0)
  })
})

// ── computeTotalCents ─────────────────────────────────────────────────────────

describe('computeTotalCents', () => {
  it('sums an array of cent values', () => {
    assert.equal(computeTotalCents([10000, 20000, 5000]), 35000)
  })

  it('returns 0 for empty array', () => {
    assert.equal(computeTotalCents([]), 0)
  })
})

// ── formatAUD ─────────────────────────────────────────────────────────────────

describe('formatAUD', () => {
  it('formats 40000 cents as AU$400.00', () => {
    assert.equal(formatAUD(40000), 'AU$400.00')
  })

  it('formats 2050 cents as AU$20.50', () => {
    assert.equal(formatAUD(2050), 'AU$20.50')
  })
})

// ── formatDateAU ──────────────────────────────────────────────────────────────

describe('formatDateAU', () => {
  it('formats 2025-12-25 as 25/12/2025', () => {
    assert.equal(formatDateAU('2025-12-25'), '25/12/2025')
  })

  it('formats 2025-01-07 as 07/01/2025', () => {
    assert.equal(formatDateAU('2025-01-07'), '07/01/2025')
  })
})
