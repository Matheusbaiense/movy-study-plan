import type { StudyCourse, StudyPlanData } from './types'

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
  return course.segments.filter((s) => s.kind === 'holiday').reduce((total, s) => total + weeks(s.weeks), 0)
}

export function courseWeeks(course: StudyCourse) {
  return course.segments.reduce((total, s) => total + weeks(s.weeks), 0)
}

export function courseTuition(course: StudyCourse) {
  if (course.type === 'elicos') return courseStudyWeeks(course) * number(course.ratePerWeek)
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

export function formatDate(isoDate: string) {
  if (!isoDate) return '-'
  const parts = isoDate.split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : isoDate
}

export function buildSchedule(plan: StudyPlanData) {
  let cursor = ''
  return plan.courses.flatMap((course) => {
    if (course.start) cursor = course.start
    return course.segments.map((segment) => {
      const start = cursor
      const duration = weeks(segment.weeks)
      const end = start ? addDays(start, duration * 7 - 1) : ''
      cursor = end ? addDays(end, 1) : ''
      return { course, segment, start, end, weeks: duration }
    })
  })
}
