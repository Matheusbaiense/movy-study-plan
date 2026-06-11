import type { ApplicantType, CourseSegment, CourseType, ElicosModule, ExtraCost, StudyCourse, StudyPlanData } from './types'

export const COURSE_TYPES: Record<CourseType, { label: string; color: string }> = {
  elicos: { label: 'ELICOS', color: '#4B1A77' },
  vet: { label: 'VET', color: '#F36B1C' },
  he: { label: 'Higher Ed', color: '#FBB615' },
}

const extraTemplates: Record<ApplicantType, Array<[ExtraCost['item'], ExtraCost['category']]>> = {
  Individual: [
    ['OSHC Single', 'oshc'],
    ['Student Visa Fee (main applicant)', 'visa'],
    ['Taxa Administrativa Movy', 'admin'],
    ['Medical Examination (if required)', 'medical'],
  ],
  Casal: [
    ['OSHC Couple', 'oshc'],
    ['Student Visa Fee (main applicant)', 'visa'],
    ['Dependent Visa Fee (+18)', 'visa'],
    ['Taxa Administrativa Movy', 'admin'],
    ['Medical Examination (if required)', 'medical'],
  ],
  Familia: [
    ['OSHC Family', 'oshc'],
    ['Student Visa Fee (main applicant)', 'visa'],
    ['Dependent Visa Fee (+18)', 'visa'],
    ['Dependent Visa Fee (-18)', 'visa'],
    ['Taxa Administrativa Movy', 'admin'],
    ['Medical Examination (if required)', 'medical'],
  ],
  'Single Parent': [
    ['OSHC Single Parent', 'oshc'],
    ['Student Visa Fee (main applicant)', 'visa'],
    ['Dependent Visa Fee (-18)', 'visa'],
    ['Taxa Administrativa Movy', 'admin'],
    ['Medical Examination (if required)', 'medical'],
  ],
}

export const COURSE_PRESETS: Array<Partial<StudyCourse> & Pick<StudyCourse, 'type' | 'provider' | 'name'>> = [
  { type: 'elicos', provider: 'Language Links', name: 'General English', ratePerWeek: 260, materialFee: 250, enrolmentFee: 250, timetable: 'Morning / Evening', paymentParts: 4, paymentFrequency: 'A cada 6 semanas', depositWeeks: 3 },
  { type: 'elicos', provider: 'Language Links', name: 'English for IELTS and Academic Purposes (EIAP)', ratePerWeek: 260, materialFee: 250, enrolmentFee: 250, timetable: 'Evening / 3 days option', paymentParts: 4, paymentFrequency: 'A cada 6 semanas', depositWeeks: 3 },
  { type: 'elicos', provider: 'ILSC', name: 'General English / Academic English', ratePerWeek: 290, materialFee: 240, enrolmentFee: 250, timetable: 'Morning / Evening', paymentParts: 4, paymentFrequency: 'A cada 5-6 semanas', depositWeeks: 4 },
  { type: 'elicos', provider: 'Milner', name: 'General English', ratePerWeek: 260, materialFee: 250, enrolmentFee: 250, timetable: 'Morning / Evening', paymentParts: 4, paymentFrequency: 'A cada 6 semanas', depositWeeks: 3 },
  { type: 'vet', provider: 'Greystone College', name: 'Diploma of Project Management', tuition: 6400, enrolmentFee: 250, materialFee: 0, hasMaterial: false, paymentParts: 5, paymentFrequency: 'Mensal' },
  { type: 'vet', provider: 'Greenwich College', name: 'Diploma + Advanced Diploma pathway', tuition: 12000, enrolmentFee: 250, materialFee: 0, hasMaterial: false, paymentParts: 8, paymentFrequency: 'Mensal' },
  { type: 'vet', provider: 'Stanley College', name: 'Diploma of Community Services', tuition: 12000, enrolmentFee: 250, materialFee: 500, hasMaterial: true, paymentParts: 4, paymentFrequency: 'Por termo' },
  { type: 'vet', provider: 'NIT Australia', name: 'Advanced Diploma of Civil Construction Design', tuition: 0, enrolmentFee: 250, materialFee: 0, hasMaterial: false, paymentParts: 8, paymentFrequency: 'Mensal' },
  { type: 'he', provider: 'ECU', name: 'Master program', tuition: 0, enrolmentFee: 0, scholarship: 0, paymentParts: 4, paymentFrequency: 'Por semestre' },
  { type: 'he', provider: 'Curtin University', name: 'Master program', tuition: 0, enrolmentFee: 0, scholarship: 0, paymentParts: 4, paymentFrequency: 'Por semestre' },
  { type: 'he', provider: 'Murdoch University', name: 'Master program', tuition: 0, enrolmentFee: 0, scholarship: 0, paymentParts: 4, paymentFrequency: 'Por semestre' },
  { type: 'he', provider: 'Kaplan Business School', name: 'Master of Business Analytics', tuition: 0, enrolmentFee: 0, scholarship: 0, paymentParts: 4, paymentFrequency: 'Por semestre' },
]

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export const ELICOS_MODULE_NAMES = ['General English', 'Cambridge', 'IELTS', 'EAP'] as const
export const DEFAULT_ELICOS_STUDY_WEEKS_BEFORE_HOLIDAY = 12
export const DEFAULT_ELICOS_HOLIDAY_WEEKS = 4
export const MAX_TRANSITION_HOLIDAY_WEEKS = 12

export const PAYMENT_CADENCES: Array<{ label: string; days: number }> = [
  { label: 'Semanal (7 dias)', days: 7 },
  { label: 'A cada 30 dias', days: 30 },
  { label: 'A cada 45 dias', days: 45 },
  { label: 'A cada 90 dias', days: 90 },
  { label: 'A cada 120 dias', days: 120 },
]

export function createElicosModule(name = 'General English', ratePerWeek = 260, moduleWeeks = 12): ElicosModule {
  return { id: uid('mod'), name, ratePerWeek, weeks: moduleWeeks }
}

function clampWeeks(value: unknown, fallback: number, min = 1, max = 104) {
  const parsed = Math.round(Number(value) || fallback)
  return Math.max(min, Math.min(max, parsed))
}

export function buildElicosSegments(
  modules: ElicosModule[],
  studyWeeksBeforeHoliday = DEFAULT_ELICOS_STUDY_WEEKS_BEFORE_HOLIDAY,
  holidayWeeks = DEFAULT_ELICOS_HOLIDAY_WEEKS,
): CourseSegment[] {
  const block = clampWeeks(studyWeeksBeforeHoliday, DEFAULT_ELICOS_STUDY_WEEKS_BEFORE_HOLIDAY, 1, 52)
  const breakWeeks = Math.max(0, Math.min(52, Math.round(Number(holidayWeeks) || 0)))
  const stream: string[] = []

  for (const elicosModule of modules) {
    const totalWeeks = Math.max(0, Math.round(Number(elicosModule.weeks) || 0))
    for (let index = 0; index < totalWeeks; index += 1) stream.push(elicosModule.name)
  }

  const segments: CourseSegment[] = []
  let cursor = 0
  while (cursor < stream.length) {
    const chunk = Math.min(block, stream.length - cursor)
    segments.push({ id: uid('seg'), label: stream[cursor] || 'Ingles', kind: 'study', weeks: chunk })
    cursor += chunk
    if (cursor < stream.length && breakWeeks > 0) {
      segments.push({ id: uid('seg'), label: 'Férias', kind: 'holiday', weeks: breakWeeks })
    }
  }
  return segments
}

export function defaultPaymentParts(type: CourseType) {
  if (type === 'elicos') return 4
  if (type === 'he') return 4
  return 6
}

export function defaultPaymentFrequency(type: CourseType) {
  if (type === 'elicos') return 'A cada 6 semanas'
  if (type === 'he') return 'Por semestre'
  return 'Mensal'
}

export function createExtraCosts(applicantType: ApplicantType): ExtraCost[] {
  return extraTemplates[applicantType].map(([item, category]) => ({
    id: uid('extra'),
    item,
    category,
    amount: 0,
  }))
}

export function createCourse(type: CourseType): StudyCourse {
  const modules = type === 'elicos' ? [createElicosModule('General English', 260, 12)] : undefined
  const studyWeeksBeforeHoliday = DEFAULT_ELICOS_STUDY_WEEKS_BEFORE_HOLIDAY
  const holidayWeeks = DEFAULT_ELICOS_HOLIDAY_WEEKS

  return {
    id: uid('course'),
    type,
    provider: '',
    name: '',
    url: '',
    timetable: 'Manha',
    start: '',
    enrolmentFee: type === 'elicos' || type === 'vet' ? 250 : 0,
    tuition: 0,
    ratePerWeek: 0,
    materialFee: type === 'elicos' ? 250 : 0,
    hasMaterial: type === 'vet',
    scholarship: 0,
    depositWeeks: type === 'elicos' ? 3 : 0,
    paymentParts: defaultPaymentParts(type),
    paymentFrequency: defaultPaymentFrequency(type),
    paymentCadenceDays: 30,
    modules,
    studyWeeksBeforeHoliday,
    holidayWeeks,
    segments: type === 'elicos' && modules
      ? buildElicosSegments(modules, studyWeeksBeforeHoliday, holidayWeeks)
      : [
          { id: uid('seg'), label: COURSE_TYPES[type].label, kind: 'study', weeks: 24 },
          { id: uid('seg'), label: 'Férias', kind: 'holiday', weeks: 4 },
        ],
  }
}

export function createBlankStudyPlan(): StudyPlanData {
  return {
    student: 'Novo Estudante',
    applicantType: 'Individual',
    studentLocation: 'offshore',
    currentVisaExpiry: '',
    consultant: '',
    email: '',
    phone: '',
    courses: [createCourse('elicos')],
    extraCosts: createExtraCosts('Individual'),
    payments: [],
    notes: '*Data estimada de vencimento do visto a ser confirmada na carta de oferta.',
    includeHolidayPlanning: true,
  }
}
