import type { CourseSegment, StudyCourse, StudyPlanData } from './types'

export function money(value: number) {
  return `AUD ${number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function number(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? 0))
  return Number.isFinite(parsed) ? parsed : 0
}

export function weeks(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? 0), 10)
  return Number.isFinite(parsed) ? parsed : 0
}

export function courseStudyWeeks(course: StudyCourse) {
  return course.segments.filter((s) => s.kind === 'study').reduce((total, s) => total + weeks(s.weeks), 0)
}

export function courseHolidayWeeks(course: StudyCourse) {
  const segHoliday = course.segments.filter((s) => s.kind === 'holiday').reduce((total, s) => total + weeks(s.weeks), 0)
  return segHoliday + weeks(course.gapBeforeWeeks)
}

export function courseWeeks(course: StudyCourse) {
  return course.segments.reduce((total, s) => total + weeks(s.weeks), 0) + weeks(course.gapBeforeWeeks)
}

export function elicosModuleWeeks(course: StudyCourse) {
  return (course.modules ?? []).reduce((total, m) => total + weeks(m.weeks), 0)
}

export function elicosModuleTuition(course: StudyCourse) {
  return (course.modules ?? []).reduce((total, m) => total + weeks(m.weeks) * number(m.ratePerWeek), 0)
}

export function courseTuition(course: StudyCourse) {
  if (course.type === 'elicos') {
    // Per-module rates take precedence; fall back to the single ratePerWeek.
    if (course.modules && course.modules.length > 0) return elicosModuleTuition(course)
    return courseStudyWeeks(course) * number(course.ratePerWeek)
  }
  return number(course.tuition)
}

export function courseMaterial(course: StudyCourse) {
  if (course.type === 'he') return 0
  if (course.type === 'vet' && !course.hasMaterial) return 0
  return number(course.materialFee)
}

export function courseTotal(course: StudyCourse) {
  return number(course.enrolmentFee) + courseTuition(course) + courseMaterial(course) - number(course.scholarship)
}

export function courseDeposit(course: StudyCourse) {
  if (course.type === 'elicos') {
    const depositWeeks = Math.min(courseStudyWeeks(course), weeks(course.depositWeeks))
    return number(course.enrolmentFee) + courseMaterial(course) + depositWeeks * number(course.ratePerWeek)
  }

  return number(course.enrolmentFee) + courseMaterial(course)
}

export function coursePaymentBalance(course: StudyCourse) {
  return Math.max(0, courseTotal(course) - courseDeposit(course))
}

export function planStudyWeeks(plan: StudyPlanData) {
  return plan.courses.reduce((total, course) => total + courseStudyWeeks(course), 0)
}

export function planHolidayWeeks(plan: StudyPlanData) {
  return plan.courses.reduce((total, course) => total + courseHolidayWeeks(course), 0)
}

export function planVisaWeeks(plan: StudyPlanData) {
  return plan.courses.reduce((total, course) => total + courseWeeks(course), 0)
}

export function planCoursesTotal(plan: StudyPlanData) {
  return plan.courses.reduce((total, course) => total + courseTotal(course), 0)
}

export function planExtrasTotal(plan: StudyPlanData) {
  return plan.extraCosts.reduce((total, extra) => total + number(extra.amount), 0)
}

export function planGrandTotal(plan: StudyPlanData) {
  return planCoursesTotal(plan) + planExtrasTotal(plan)
}

export function planCourseDeposits(plan: StudyPlanData) {
  return plan.courses.reduce((total, course) => total + courseDeposit(course), 0)
}

export function planPaymentBalance(plan: StudyPlanData) {
  return plan.courses.reduce((total, course) => total + coursePaymentBalance(course), 0)
}

export function addDays(isoDate: string, days: number) {
  if (!isoDate) return ''
  // Parse and compute in UTC so the result is independent of the
  // viewer's timezone (consultants run east of UTC, e.g. Australia/Perth).
  const date = new Date(`${isoDate}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return ''
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function daysBetween(aIso: string, bIso: string) {
  if (!aIso || !bIso) return 0
  const a = new Date(`${aIso}T00:00:00Z`).getTime()
  const b = new Date(`${bIso}T00:00:00Z`).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return 0
  return Math.round((b - a) / 86400000)
}

export function formatDate(isoDate: string) {
  if (!isoDate) return '-'
  const parts = isoDate.split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : isoDate
}

export type ScheduleRow = {
  course: StudyCourse
  segment: CourseSegment
  start: string
  end: string
  weeks: number
}

export function buildSchedule(plan: StudyPlanData): ScheduleRow[] {
  let cursor = ''
  return plan.courses.flatMap((course) => {
    if (course.start) cursor = course.start
    const rows: ScheduleRow[] = []
    // Transition holiday before this course (ELICOS → AQF), counted in the timeline.
    const gap = weeks(course.gapBeforeWeeks)
    if (gap > 0 && cursor) {
      const start = cursor
      const end = addDays(start, gap * 7 - 1)
      cursor = addDays(end, 1)
      rows.push({
        course,
        segment: { id: `gap-${course.id}`, label: 'Férias (transição)', kind: 'holiday', weeks: gap },
        start,
        end,
        weeks: gap,
      })
    }
    for (const segment of course.segments) {
      const start = cursor
      const duration = weeks(segment.weeks)
      const end = start ? addDays(start, duration * 7 - 1) : ''
      cursor = end ? addDays(end, 1) : ''
      rows.push({ course, segment, start, end, weeks: duration })
    }
    return rows
  })
}

// ── UTC-safe date helpers ───────────────────────────────────────────────────

// Snap a date to the Monday on or after it (ELICOS intakes start on Mondays).
export function nextMonday(isoDate: string) {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return ''
  const delta = (1 - date.getUTCDay() + 7) % 7
  date.setUTCDate(date.getUTCDate() + delta)
  return date.toISOString().slice(0, 10)
}

export function addMonths(isoDate: string, months: number) {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return ''
  const day = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + months)
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()
  date.setUTCDate(Math.min(day, lastDay))
  return date.toISOString().slice(0, 10)
}

export function monthsBetween(aIso: string, bIso: string) {
  if (!aIso || !bIso) return 0
  const a = new Date(`${aIso}T00:00:00Z`)
  const b = new Date(`${bIso}T00:00:00Z`)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0
  let m = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth())
  if (b.getUTCDate() < a.getUTCDate()) m -= 1
  return m
}

// ── New estimated visa expiry (Home Affairs rules) ──────────────────────────

export interface VisaExpiryResult {
  date: string
  rule: string
  durationMonths: number
}

// courseEndIso = CoE end (end of the last STUDY period of the whole pathway).
export function visaExpiry(startIso: string, courseEndIso: string): VisaExpiryResult {
  if (!startIso || !courseEndIso) return { date: '', rule: '', durationMonths: 0 }
  const durationMonths = monthsBetween(startIso, courseEndIso)
  const end = new Date(`${courseEndIso}T00:00:00Z`)
  const endMonth = end.getUTCMonth() + 1
  if (durationMonths >= 10) {
    if (endMonth === 11 || endMonth === 12) {
      const date = new Date(Date.UTC(end.getUTCFullYear() + 1, 2, 15)).toISOString().slice(0, 10)
      return { date, rule: 'Regra dos 15 de março (curso ≥10 meses terminando em nov/dez)', durationMonths }
    }
    return { date: addMonths(courseEndIso, 2), rule: '+2 meses (curso ≥10 meses terminando jan–out)', durationMonths }
  }
  return { date: addMonths(courseEndIso, 1), rule: '+1 mês (curso <10 meses)', durationMonths }
}

export function planFirstStart(plan: StudyPlanData) {
  const course = plan.courses.find((c) => c.start)
  return course ? course.start : ''
}

// CoE end = end of the last study segment in the chained schedule.
export function planCourseEnd(plan: StudyPlanData) {
  const rows = buildSchedule(plan)
  const lastStudy = [...rows].reverse().find((r) => r.segment.kind === 'study' && r.end)
  return lastStudy ? lastStudy.end : ''
}

export function planNewVisaDate(plan: StudyPlanData): VisaExpiryResult {
  return visaExpiry(planFirstStart(plan), planCourseEnd(plan))
}

// ── Installments with real due dates ────────────────────────────────────────

export interface DatedInstallment {
  item: string
  due: string
  amount: number
}

// Splits a balance into `parts` installments spaced `intervalDays` apart from
// `startIso`. The last installment absorbs the rounding remainder.
export function datedInstallments(
  balance: number,
  parts: number,
  intervalDays: number,
  startIso: string,
  label: string,
): DatedInstallment[] {
  const count = Math.max(1, Math.round(number(parts) || 1))
  const step = Math.max(0, Math.round(number(intervalDays)))
  const each = Math.round((number(balance) / count) * 100) / 100
  const out: DatedInstallment[] = []
  for (let i = 1; i <= count; i++) {
    const amount = i === count ? Math.round((number(balance) - each * (count - 1)) * 100) / 100 : each
    out.push({
      item: `${label} - Parcela ${i}`,
      due: startIso ? addDays(startIso, (i - 1) * step) : '',
      amount,
    })
  }
  return out
}
