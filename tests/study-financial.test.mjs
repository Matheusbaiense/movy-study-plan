import test from 'node:test'
import assert from 'node:assert/strict'

const financial = await import('../lib/financial/calculator.ts')
const defaults = await import('../lib/study-plans/defaults.ts')
const calculations = await import('../lib/study-plans/calculations.ts')
const money = await import('../lib/calc/money.ts')
const rules = await import('../lib/calc/rules.ts')
const scenarios = await import('../lib/calc/scenarios.ts')

function makeElicos({ weeks = 24, rate = 290, scholarship = 0, start = '2026-08-03' } = {}) {
  return {
    id: 'c1',
    type: 'elicos',
    provider: 'Test College',
    name: 'General English',
    url: '',
    timetable: 'Manha',
    start,
    enrolmentFee: 250,
    tuition: 0,
    ratePerWeek: rate,
    materialFee: 15,
    hasMaterial: true,
    scholarship,
    depositWeeks: 4,
    paymentParts: 4,
    paymentFrequency: '',
    segments: [{ id: 's1', label: 'Estudo', kind: 'study', weeks }],
  }
}

function makePlan(course, location = 'offshore') {
  return {
    student: 'Test',
    applicantType: 'Individual',
    currentVisaExpiry: '',
    consultant: '',
    email: '',
    phone: '',
    courses: [course],
    extraCosts: [],
    payments: [],
    notes: '',
    studentLocation: location,
  }
}

test('financial calculator matches current workbook constants', () => {
  const input = {
    student: 'Example',
    applicationDate: '2026-05-08',
    location: 'offshore',
    visaMonths: 12,
    adults: 1,
    dependents5to18: 1,
    dependentsUnder5: 0,
    exchangeRate: 2.62,
    travelCost: financial.defaultTravelCost({
      location: 'offshore',
      adults: 1,
      dependents5to18: 1,
      dependentsUnder5: 0,
    }),
    remainingCourseFee: 0,
  }

  const result = financial.computeFinancialCapacity(input)
  assert.equal(result.costOfLiving, 34159)
  assert.equal(result.travelCost, 4000)
  assert.equal(result.dependentSchoolFee, 13502)
  assert.equal(result.totalAud, 51661)
  assert.equal(result.totalBrl, 135351.82)
})

test('school-age dependent school fee is prorated below 12 months', () => {
  const result = financial.computeFinancialCapacity({
    student: 'Example',
    applicationDate: '2026-05-08',
    location: 'onshore',
    visaMonths: 6,
    adults: 1,
    dependents5to18: 1,
    dependentsUnder5: 0,
    exchangeRate: 3,
    travelCost: financial.defaultTravelCost({
      location: 'onshore',
      adults: 1,
      dependents5to18: 1,
      dependentsUnder5: 0,
    }),
    remainingCourseFee: 5000,
  })

  assert.equal(result.dependentSchoolFee, 6751)
  assert.equal(result.travelCost, 2000)
})

test('ELICOS holiday pattern is configurable and drives schedule dates', () => {
  const modules = [defaults.createElicosModule('General English', 300, 30)]
  const segments = defaults.buildElicosSegments(modules, 20, 2)
  assert.deepEqual(
    segments.map((segment) => [segment.kind, segment.weeks]),
    [['study', 20], ['holiday', 2], ['study', 10]],
  )

  const course = {
    ...defaults.createCourse('elicos'),
    start: '2026-01-05',
    modules,
    studyWeeksBeforeHoliday: 20,
    holidayWeeks: 2,
    segments,
  }
  const plan = {
    student: 'Timeline',
    applicantType: 'Individual',
    studentLocation: 'offshore',
    currentVisaExpiry: '',
    consultant: '',
    email: '',
    phone: '',
    courses: [course],
    extraCosts: [],
    payments: [],
    notes: '',
  }

  const rows = calculations.buildSchedule(plan)
  assert.equal(rows.at(0).start, '2026-01-05')
  assert.equal(rows.at(0).end, '2026-05-24')
  assert.equal(rows.at(1).start, '2026-05-25')
  assert.equal(rows.at(1).end, '2026-06-07')
  assert.equal(rows.at(2).start, '2026-06-08')
  assert.equal(rows.at(2).end, '2026-08-16')
  assert.equal(calculations.planHolidayWeeks(plan), 2)
})

test('ELICOS deposit consumes the first module rates instead of a stale flat rate', () => {
  const course = {
    ...defaults.createCourse('elicos'),
    enrolmentFee: 250,
    materialFee: 100,
    depositWeeks: 12,
    ratePerWeek: 0,
    modules: [
      defaults.createElicosModule('General English', 300, 10),
      defaults.createElicosModule('IELTS', 250, 10),
    ],
  }
  course.segments = defaults.buildElicosSegments(course.modules, 12, 4)

  assert.equal(calculations.courseDeposit(course), 3850)
})

// ── SPLIT 1: integer-cents money helpers ────────────────────────────────────

test('toCents coerces legacy floats and guards binary FP drift', () => {
  assert.equal(money.toCents(0.1), 10)
  assert.equal(money.toCents(0.2), 20)
  // 0.1 + 0.2 === 0.30000000000000004 in IEEE-754; must still land on 30 cents.
  assert.equal(money.toCents(0.1 + 0.2), 30)
  // 10.005 dollars === 1000.5 cents → half rounds away from zero → 1001.
  assert.equal(money.toCents(10.005), 1001)
  assert.equal(money.toCents(-1.005), -101)
  assert.equal(money.toCents('1234.56'), 123456)
  assert.equal(money.toCents(0), 0)
  assert.ok(!Object.is(money.toCents(0), -0))
})

test('centsToNumber and parseMoneyToCents round-trip across locales', () => {
  assert.equal(money.centsToNumber(1001), 10.01)
  assert.equal(money.parseMoneyToCents('1.234,56'), 123456) // pt-BR
  assert.equal(money.parseMoneyToCents('1,234.56'), 123456) // en-US
  assert.equal(money.parseMoneyToCents('R$ 1.000,00'), 100000)
  assert.equal(money.parseMoneyToCents('1234.5'), 123450)
  assert.equal(money.parseMoneyToCents(12.34), 1234)
  assert.equal(money.parseMoneyToCents(''), 0)
})

test('parseMoneyToCents disambiguates thousands vs decimal (locale-aware)', () => {
  // pt-BR thousands with a lone/repeated dot (would misparse via parseFloat).
  assert.equal(money.parseMoneyToCents('1.234'), 123400)
  assert.equal(money.parseMoneyToCents('1.500'), 150000)
  assert.equal(money.parseMoneyToCents('1.234.567'), 123456700)
  assert.equal(money.parseMoneyToCents('100.000'), 10000000)
  // Lone dot with 1–2 trailing digits stays decimal.
  assert.equal(money.parseMoneyToCents('12.34'), 1234)
  assert.equal(money.parseMoneyToCents('0.5'), 50)
  // Comma: lone = decimal (pt-BR); repeated = en-US thousands.
  assert.equal(money.parseMoneyToCents('1,5'), 150)
  assert.equal(money.parseMoneyToCents('1,234,567'), 123456700)
  // Negative + currency symbol.
  assert.equal(money.parseMoneyToCents('-R$ 1.234,56'), -123456)
})

test('applyRules: empty ruleSet is a no-op (course + plan unchanged)', () => {
  const plan = makePlan(makeElicos())
  const res = rules.applyRulesToPlan(plan, [])
  assert.equal(res.plan, plan)
  assert.deepEqual(res.adjustments, [])
})

test('applyRules: promo_rate_override fires only when week condition matches', () => {
  const course = makeElicos({ weeks: 24, rate: 290 })
  const promo = { id: 'p1', scope: 'type', when: { courseType: 'elicos', minWeeks: 24 }, effect: { kind: 'promo_rate_override', ratePerWeek: 260 } }
  const hit = rules.applyRulesToCourse(course, [promo], { location: 'offshore' })
  assert.equal(hit.course.ratePerWeek, 260)
  assert.equal(hit.adjustments.length, 1)

  // A 20-week course must NOT get the >=24 promo.
  const miss = rules.applyRulesToCourse(makeElicos({ weeks: 20, rate: 290 }), [promo])
  assert.equal(miss.course.ratePerWeek, 290)
  assert.equal(miss.adjustments.length, 0)
})

test('applyRules: discount lowers the course total via scholarship', () => {
  const course = makeElicos({ weeks: 24, rate: 290, scholarship: 0 })
  const before = calculations.courseTotalCents(course)
  const res = rules.applyRulesToCourse(course, [{ id: 'd1', scope: 'org', when: {}, effect: { kind: 'discount_fixed', amount: 500 } }])
  assert.equal(res.course.scholarship, 500)
  assert.equal(calculations.courseTotalCents(res.course), before - 50000)
})

test('applyRules: agency_fee adds an extra line (off by default until activated)', () => {
  const course = makeElicos()
  const fee = { id: 'f1', scope: 'org', when: {}, isActive: true, effect: { kind: 'agency_fee', amount: 350, label: 'Taxa Movy' } }
  const res = rules.applyRulesToCourse(course, [fee])
  assert.equal(res.extras.length, 1)
  assert.equal(res.extras[0].amount, 350)
  // An inactive rule is skipped.
  const off = rules.applyRulesToCourse(course, [{ ...fee, isActive: false }])
  assert.equal(off.extras.length, 0)
})

test('applyRules: nationality condition targets a market only', () => {
  const course = makeElicos({ weeks: 24, rate: 290 })
  const promoBR = { id: 'br', scope: 'type', when: { courseType: 'elicos', nationality: 'BR' }, effect: { kind: 'promo_rate_override', ratePerWeek: 250 } }
  const hit = rules.applyRulesToCourse(course, [promoBR], { nationality: 'BR' })
  assert.equal(hit.course.ratePerWeek, 250)
  const miss = rules.applyRulesToCourse(course, [promoBR], { nationality: 'CN' })
  assert.equal(miss.course.ratePerWeek, 290)
  // applyRulesToPlan threads the nationality option through.
  const plan = makePlan(course)
  assert.equal(rules.applyRulesToPlan(plan, [promoBR], { nationality: 'BR' }).plan.courses[0].ratePerWeek, 250)
  assert.equal(rules.applyRulesToPlan(plan, [promoBR], { nationality: 'CN' }).plan.courses[0].ratePerWeek, 290)
})

test('computeScenarios totals each plan variant through the engine', () => {
  const base = makePlan(makeElicos({ weeks: 24 }))
  const results = scenarios.computeScenarios([
    { label: '24 sem', plan: base },
    { label: '12 sem', plan: scenarios.withFirstCourseStudyWeeks(base, 12) },
  ])
  assert.equal(results.length, 2)
  assert.equal(results[0].computed.studyWeeks, 24)
  assert.equal(results[1].computed.studyWeeks, 12)
  assert.ok(results[1].computed.grandTotalCents < results[0].computed.grandTotalCents)
})

test('splitCents partitions a total with the remainder on the last part', () => {
  const parts = money.splitCents(10000, 3)
  assert.deepEqual(parts, [3333, 3333, 3334])
  assert.equal(parts.reduce((a, b) => a + b, 0), 10000)
  assert.deepEqual(money.splitCents(999, 1), [999])
})

test('formatMoney renders integer cents via Intl with the value currency', () => {
  assert.ok(money.formatMoney(123456, 'AUD').includes('1.234,56'))
})

// ── SPLIT 1: computeProposal snapshot (single source, integer cents) ────────

test('computeProposal returns a versioned integer-cents snapshot', () => {
  const course = {
    ...defaults.createCourse('elicos'),
    enrolmentFee: 250,
    materialFee: 100,
    depositWeeks: 12,
    ratePerWeek: 0,
    modules: [
      defaults.createElicosModule('General English', 300, 10),
      defaults.createElicosModule('IELTS', 250, 10),
    ],
  }
  course.segments = defaults.buildElicosSegments(course.modules, 12, 4)

  const plan = {
    student: 'Cents',
    applicantType: 'Individual',
    studentLocation: 'offshore',
    currentVisaExpiry: '',
    consultant: '',
    email: '',
    phone: '',
    courses: [course],
    // Float extras that would drift if summed as dollars: 0.1 + 0.2 must equal 30 cents.
    extraCosts: [
      { id: 'e1', item: 'A', category: 'other', amount: 0.1 },
      { id: 'e2', item: 'B', category: 'other', amount: 0.2 },
    ],
    payments: [],
    notes: '',
  }

  const computed = calculations.computeProposal(plan)

  assert.equal(computed.version, 1)
  assert.equal(computed.version, calculations.COMPUTED_VERSION)
  assert.equal(computed.currencyCode, 'AUD')

  const c0 = computed.perCourse[0]
  assert.equal(c0.tuitionCents, 550000) // 300*10 + 250*10 dollars
  assert.equal(c0.totalCents, 585000) // 250 + 5500 + 100 - 0
  assert.equal(c0.depositCents, 385000) // matches courseDeposit float test (3850)
  assert.equal(c0.studyWeeks, 20)
  // Offshore ELICOS under 25 study weeks cannot installment → full total upfront.
  assert.equal(c0.canInstallment, false)
  assert.equal(c0.upfrontCents, 585000)
  assert.equal(c0.installmentBalanceCents, 0)

  assert.equal(computed.coursesTotalCents, 585000)
  assert.equal(computed.extrasTotalCents, 30)
  assert.equal(computed.grandTotalCents, 585030)
  assert.equal(computed.upfrontSchoolsCents, 585000)
})

test('computeFinancialCapacityCents bridges the float result to integer cents', () => {
  const input = {
    student: 'Example',
    applicationDate: '2026-05-08',
    location: 'offshore',
    visaMonths: 12,
    adults: 1,
    dependents5to18: 1,
    dependentsUnder5: 0,
    exchangeRate: 2.62,
    travelCost: 4000,
    remainingCourseFee: 0,
  }
  const cents = financial.computeFinancialCapacityCents(input)
  assert.equal(cents.baseCurrencyCode, 'AUD')
  assert.equal(cents.exchangedCurrencyCode, 'BRL')
  assert.equal(cents.totalAudCents, 5166100) // 51661.00 AUD
  assert.equal(cents.totalBrlCents, 13535182) // 135351.82 BRL
})
