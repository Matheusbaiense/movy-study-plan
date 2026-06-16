import test from 'node:test'
import assert from 'node:assert/strict'

const options = await import('../lib/study-plans/options.ts')
const defaults = await import('../lib/study-plans/defaults.ts')

function makeElicos({ weeks = 24, rate = 290 } = {}) {
  return {
    id: 'c1',
    type: 'elicos',
    provider: 'Test College',
    name: 'General English',
    url: '',
    timetable: 'Manha',
    start: '2026-08-03',
    enrolmentFee: 250,
    tuition: 0,
    ratePerWeek: rate,
    materialFee: 15,
    hasMaterial: true,
    scholarship: 0,
    depositWeeks: 4,
    paymentParts: 4,
    paymentFrequency: '',
    segments: [{ id: 's1', label: 'Estudo', kind: 'study', weeks }],
    modules: [defaults.createElicosModule('General English', rate, weeks)],
  }
}

function makePlan(courses, extraCosts = []) {
  return {
    student: 'Test',
    applicantType: 'Individual',
    currentVisaExpiry: '',
    consultant: '',
    email: '',
    phone: '',
    courses,
    extraCosts,
    payments: [],
    notes: '',
    studentLocation: 'offshore',
  }
}

test('createOption seeds an empty option with a generated id and recommended=false', () => {
  const opt = options.createOption('Opção 2')
  assert.equal(opt.label, 'Opção 2')
  assert.ok(opt.id.length > 0)
  assert.deepEqual(opt.courses, [])
  assert.deepEqual(opt.extraCosts, [])
  assert.equal(opt.recommended, false)
})

test('createOption with a seed clones the mix with FRESH ids (no shared keys)', () => {
  const course = makeElicos()
  const extras = [{ id: 'e1', item: 'OSHC', category: 'oshc', amount: 600 }]
  const opt = options.createOption('Opção 2', { courses: [course], extraCosts: extras })
  assert.equal(opt.courses.length, 1)
  assert.notEqual(opt.courses[0].id, course.id)
  assert.notEqual(opt.courses[0].segments[0].id, course.segments[0].id)
  assert.notEqual(opt.extraCosts[0].id, extras[0].id)
  // Source mix untouched.
  assert.equal(course.id, 'c1')
  assert.equal(course.segments[0].id, 's1')
})

test('duplicateOption clones with a new id and fresh course/extra ids', () => {
  const base = options.createOption('Opção 1', { courses: [makeElicos()] })
  const copy = options.duplicateOption(base)
  assert.notEqual(copy.id, base.id)
  assert.match(copy.label, /cópia/)
  assert.notEqual(copy.courses[0].id, base.courses[0].id)
  assert.equal(copy.recommended, false)
  // A custom label overrides the default.
  assert.equal(options.duplicateOption(base, 'Premium').label, 'Premium')
})

test('withRecomputed fills an integer-cents computed snapshot threaded with plan context', () => {
  const plan = makePlan([makeElicos({ weeks: 24 })])
  const opt = options.createOption('Opção 2', { courses: [makeElicos({ weeks: 12 })] })
  const recomputed = options.withRecomputed(opt, plan)
  assert.ok(recomputed.computed)
  assert.equal(recomputed.computed.studyWeeks, 12)
  assert.ok(Number.isInteger(recomputed.computed.grandTotalCents))
  assert.ok(recomputed.computed.grandTotalCents > 0)
  // Input option not mutated.
  assert.equal(opt.computed, undefined)
})

test('setRecommended marks exactly one option and clears the rest', () => {
  const list = [options.createOption('A'), options.createOption('B'), options.createOption('C')]
  const marked = options.setRecommended(list, list[1].id)
  assert.deepEqual(marked.map((o) => o.recommended), [false, true, false])
  // Switching is exclusive.
  const switched = options.setRecommended(marked, list[2].id)
  assert.deepEqual(switched.map((o) => o.recommended), [false, false, true])
})

test('canAddOption caps total options (primary + extras) at the max', () => {
  // primary counts as 1; with 4 extras we hit 5 → no more.
  assert.equal(options.MAX_PROPOSAL_OPTIONS, 5)
  assert.equal(options.canAddOption(0), true)
  assert.equal(options.canAddOption(3), true)
  assert.equal(options.canAddOption(4), false)
})
