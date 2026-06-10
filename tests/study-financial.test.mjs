import test from 'node:test'
import assert from 'node:assert/strict'

const financial = await import('../lib/financial/calculator.ts')
const defaults = await import('../lib/study-plans/defaults.ts')
const calculations = await import('../lib/study-plans/calculations.ts')

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
