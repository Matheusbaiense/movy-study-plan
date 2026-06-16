// tests/study-plans-actions.test.mts
// Unit tests for the pure business-logic layer that powers the study-plan
// server actions. Server actions themselves require a live Supabase connection;
// the functions below are pure and cover the critical computation paths.

import test from 'node:test'
import assert from 'node:assert/strict'

const calc = await import('../lib/study-plans/calculations.ts')
const defs = await import('../lib/study-plans/defaults.ts')

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeElicosSegments(studyWeeks: number, holidayWeeks = 0) {
  return [
    { id: 'seg1', label: 'General English', kind: 'study' as const, weeks: studyWeeks },
    ...(holidayWeeks > 0
      ? [{ id: 'seg2', label: 'Férias', kind: 'holiday' as const, weeks: holidayWeeks }]
      : []),
  ]
}

function makeElicosCourse(studyWeeks: number, ratePerWeek: number, enrolmentFee = 250, materialFee = 250) {
  return {
    id: 'c1',
    type: 'elicos' as const,
    provider: 'Test School',
    name: 'General English',
    url: '',
    timetable: 'Morning',
    start: '',
    enrolmentFee,
    tuition: 0,
    ratePerWeek,
    materialFee,
    hasMaterial: false,
    scholarship: 0,
    depositWeeks: 3,
    paymentParts: 4,
    paymentFrequency: 'A cada 6 semanas',
    paymentCadenceDays: 30,
    modules: undefined,
    studyWeeksBeforeHoliday: 12,
    holidayWeeks: 4,
    segments: makeElicosSegments(studyWeeks),
  }
}

function makeVetCourse(tuition: number, enrolmentFee = 250) {
  return {
    id: 'c2',
    type: 'vet' as const,
    provider: 'Greystone College',
    name: 'Diploma of Project Management',
    url: '',
    timetable: 'Full-time',
    start: '',
    enrolmentFee,
    tuition,
    ratePerWeek: 0,
    materialFee: 0,
    hasMaterial: false,
    scholarship: 0,
    depositWeeks: 0,
    paymentParts: 5,
    paymentFrequency: 'Mensal',
    paymentCadenceDays: 30,
    modules: undefined,
    studyWeeksBeforeHoliday: 12,
    holidayWeeks: 4,
    segments: [{ id: 'seg1', label: 'VET', kind: 'study' as const, weeks: 52 }],
  }
}

function makeMinimalPlan(courses: any[], extras: any[] = []) {
  return {
    student: 'Test Student',
    applicantType: 'Individual' as const,
    studentLocation: 'onshore' as const,
    currentVisaExpiry: '',
    consultant: '',
    email: '',
    phone: '',
    courses,
    extraCosts: extras,
    payments: [],
    notes: '',
    includeHolidayPlanning: false,
  }
}

// ─── courseStudyWeeks ─────────────────────────────────────────────────────────

test('courseStudyWeeks: sums study segments only', () => {
  const course = makeElicosCourse(20, 260)
  course.segments = makeElicosSegments(20, 4)
  assert.equal(calc.courseStudyWeeks(course), 20)
})

test('courseStudyWeeks: ignores holiday segments', () => {
  const course = makeElicosCourse(12, 260)
  course.segments = [
    { id: 's1', label: 'English', kind: 'study', weeks: 12 },
    { id: 's2', label: 'Férias', kind: 'holiday', weeks: 4 },
    { id: 's3', label: 'English', kind: 'study', weeks: 8 },
  ]
  assert.equal(calc.courseStudyWeeks(course), 20)
})

// ─── courseTuitionCents ───────────────────────────────────────────────────────

test('courseTuitionCents: ELICOS 12 weeks at $260/wk = 312000 cents', () => {
  const course = makeElicosCourse(12, 260)
  assert.equal(calc.courseTuitionCents(course), 312_000)
})

test('courseTuitionCents: VET uses flat tuition field', () => {
  const course = makeVetCourse(6400)
  assert.equal(calc.courseTuitionCents(course), 640_000)
})

test('courseTuitionCents: HE course with scholarship reduces total correctly', () => {
  const course = {
    ...makeVetCourse(10000, 0),
    type: 'he' as const,
    scholarship: 2000,
  }
  // tuition = 10000 → 1_000_000 cents; material for HE = 0
  assert.equal(calc.courseTuitionCents(course), 1_000_000)
  // total should subtract scholarship: 1_000_000 - 200_000 = 800_000
  assert.equal(calc.courseTotalCents(course), 800_000)
})

// ─── courseTotalCents ─────────────────────────────────────────────────────────

test('courseTotalCents: ELICOS = enrolment + tuition + material - scholarship', () => {
  const course = makeElicosCourse(12, 260, 250, 250)
  // enrolment=25000, tuition=312000, material=25000, scholarship=0
  assert.equal(calc.courseTotalCents(course), 362_000)
})

test('courseTotalCents: ELICOS with scholarship deduction', () => {
  const course = { ...makeElicosCourse(12, 260, 250, 250), scholarship: 500 }
  // 362000 - 50000 = 312000
  assert.equal(calc.courseTotalCents(course), 312_000)
})

// ─── courseCanInstallment ─────────────────────────────────────────────────────

test('courseCanInstallment: offshore ELICOS < 25 weeks cannot installment', () => {
  const course = makeElicosCourse(24, 260)
  assert.equal(calc.courseCanInstallment(course, 'offshore'), false)
})

test('courseCanInstallment: offshore ELICOS = 25 weeks can installment', () => {
  const course = makeElicosCourse(25, 260)
  assert.equal(calc.courseCanInstallment(course, 'offshore'), true)
})

test('courseCanInstallment: onshore ELICOS always can installment regardless of weeks', () => {
  const course = makeElicosCourse(10, 260)
  assert.equal(calc.courseCanInstallment(course, 'onshore'), true)
})

test('courseCanInstallment: VET always can installment', () => {
  const course = makeVetCourse(6400)
  assert.equal(calc.courseCanInstallment(course, 'offshore'), true)
})

// ─── planGrandTotalCents ──────────────────────────────────────────────────────

test('planGrandTotalCents: single course + zero extras', () => {
  const course = makeElicosCourse(12, 260, 250, 250)
  const plan = makeMinimalPlan([course])
  assert.equal(calc.planGrandTotalCents(plan), 362_000)
})

test('planGrandTotalCents: adds extra costs', () => {
  const course = makeElicosCourse(12, 260, 250, 250)
  const extras = [
    { id: 'e1', item: 'OSHC Single', category: 'oshc', amount: 700 },
    { id: 'e2', item: 'Visa Fee', category: 'visa', amount: 630 },
  ]
  const plan = makeMinimalPlan([course], extras)
  // 362000 + 70000 + 63000 = 495000
  assert.equal(calc.planGrandTotalCents(plan), 495_000)
})

test('planGrandTotalCents: two courses summed correctly', () => {
  const elicos = makeElicosCourse(12, 260, 250, 250) // 362000
  const vet = makeVetCourse(6400, 250)               // 640000+25000=665000
  const plan = makeMinimalPlan([elicos, vet])
  assert.equal(calc.planGrandTotalCents(plan), 1_027_000)
})

// ─── computeProposal ─────────────────────────────────────────────────────────

test('computeProposal: version is COMPUTED_VERSION', () => {
  const plan = makeMinimalPlan([makeElicosCourse(12, 260)])
  const computed = calc.computeProposal(plan)
  assert.equal(computed.version, calc.COMPUTED_VERSION)
})

test('computeProposal: grandTotalCents matches planGrandTotalCents', () => {
  const course = makeElicosCourse(12, 260, 250, 250)
  const plan = makeMinimalPlan([course], [{ id: 'e1', item: 'OSHC', category: 'oshc', amount: 700 }])
  const computed = calc.computeProposal(plan)
  assert.equal(computed.grandTotalCents, calc.planGrandTotalCents(plan))
})

test('computeProposal: studyWeeks correct for single ELICOS', () => {
  const course = makeElicosCourse(16, 260)
  const plan = makeMinimalPlan([course])
  const computed = calc.computeProposal(plan)
  assert.equal(computed.studyWeeks, 16)
})

test('computeProposal: perCourse has one entry per course', () => {
  const plan = makeMinimalPlan([makeElicosCourse(12, 260), makeVetCourse(6400)])
  const computed = calc.computeProposal(plan)
  assert.equal(computed.perCourse.length, 2)
})

test('computeProposal: offshore ELICOS < 25 weeks shows upfront = full total', () => {
  const course = makeElicosCourse(12, 260, 250, 250) // 362000 cents total
  const plan = { ...makeMinimalPlan([course]), studentLocation: 'offshore' as const }
  const computed = calc.computeProposal(plan)
  const pc = computed.perCourse[0]
  assert.equal(pc.canInstallment, false)
  assert.equal(pc.upfrontCents, pc.totalCents)
  assert.equal(pc.installmentBalanceCents, 0)
})

// ─── createBlankStudyPlan ─────────────────────────────────────────────────────

test('createBlankStudyPlan: returns plan with one ELICOS course', () => {
  const plan = defs.createBlankStudyPlan()
  assert.equal(plan.courses.length, 1)
  assert.equal(plan.courses[0].type, 'elicos')
})

test('createBlankStudyPlan: applicantType defaults to Individual', () => {
  const plan = defs.createBlankStudyPlan()
  assert.equal(plan.applicantType, 'Individual')
})

test('createBlankStudyPlan: studentLocation defaults to offshore', () => {
  const plan = defs.createBlankStudyPlan()
  assert.equal(plan.studentLocation, 'offshore')
})

test('createBlankStudyPlan: extraCosts initialised for Individual applicant type', () => {
  const plan = defs.createBlankStudyPlan()
  const categories = plan.extraCosts.map((e) => e.category)
  assert.ok(categories.includes('oshc'))
  assert.ok(categories.includes('visa'))
  assert.ok(categories.includes('admin'))
})

// ─── buildElicosSegments ─────────────────────────────────────────────────────

test('buildElicosSegments: single module 12 weeks no holiday', () => {
  const module = { id: 'm1', name: 'General English', ratePerWeek: 260, weeks: 12 }
  const segments = defs.buildElicosSegments([module], 12, 0)
  assert.equal(segments.length, 1)
  assert.equal(segments[0].kind, 'study')
  assert.equal(segments[0].weeks, 12)
})

test('buildElicosSegments: 24-week module with 12-week blocks and 4-week holiday', () => {
  const module = { id: 'm1', name: 'General English', ratePerWeek: 260, weeks: 24 }
  const segments = defs.buildElicosSegments([module], 12, 4)
  // expect: [study 12, holiday 4, study 12]
  assert.equal(segments.length, 3)
  assert.equal(segments[0].kind, 'study')
  assert.equal(segments[0].weeks, 12)
  assert.equal(segments[1].kind, 'holiday')
  assert.equal(segments[1].weeks, 4)
  assert.equal(segments[2].kind, 'study')
  assert.equal(segments[2].weeks, 12)
})

test('buildElicosSegments: total study weeks preserved across segments', () => {
  const module = { id: 'm1', name: 'General English', ratePerWeek: 260, weeks: 30 }
  const segments = defs.buildElicosSegments([module], 12, 4)
  const totalStudy = segments.filter((s) => s.kind === 'study').reduce((n, s) => n + s.weeks, 0)
  assert.equal(totalStudy, 30)
})

// ─── addDays ──────────────────────────────────────────────────────────────────

test('addDays: adds days correctly in UTC', () => {
  assert.equal(calc.addDays('2026-06-15', 7), '2026-06-22')
})

test('addDays: crosses month boundary', () => {
  assert.equal(calc.addDays('2026-01-28', 7), '2026-02-04')
})

test('addDays: returns empty string for invalid input', () => {
  assert.equal(calc.addDays('', 7), '')
  assert.equal(calc.addDays('invalid', 7), '')
})
