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
  Família: [
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

// ── ELICOS modules, transition holiday and payment cadences ─────────────────

export const ELICOS_MODULE_NAMES = ['General English', 'Cambridge', 'IELTS', 'EAP'] as const

// Holiday between ELICOS and the AQF course (VET/HE). Within ELICOS itself the
// rule is 12 study + 4 holiday; the transition holiday tops out at 8 weeks,
// except for the few fixed public-university intakes.
export const MAX_TRANSITION_HOLIDAY_WEEKS = 8

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

// Build study/holiday segments from ELICOS modules using the 12-week study +
// 4-week holiday rule, labelling each study block with its active module.
export function buildElicosSegments(modules: ElicosModule[]): CourseSegment[] {
  const stream: string[] = []
  for (const m of modules) {
    const w = Math.max(0, Math.round(Number(m.weeks) || 0))
    for (let i = 0; i < w; i++) stream.push(m.name)
  }
  const segments: CourseSegment[] = []
  let i = 0
  while (i < stream.length) {
    const chunk = Math.min(12, stream.length - i)
    segments.push({ id: uid('seg'), label: stream[i] || 'Inglês', kind: 'study', weeks: chunk })
    i += chunk
    if (i < stream.length) segments.push({ id: uid('seg'), label: 'Férias', kind: 'holiday', weeks: 4 })
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
  return {
    id: uid('course'),
    type,
    provider: '',
    name: '',
    url: '',
    timetable: '',
    start: '',
    enrolmentFee: 0,
    tuition: 0,
    ratePerWeek: 0,
    materialFee: 0,
    hasMaterial: type === 'vet',
    scholarship: 0,
    depositWeeks: type === 'elicos' ? 3 : 0,
    paymentParts: defaultPaymentParts(type),
    paymentFrequency: defaultPaymentFrequency(type),
    segments: type === 'elicos'
      ? [
          { id: uid('seg'), label: 'General English', kind: 'study', weeks: 12 },
          { id: uid('seg'), label: 'Férias', kind: 'holiday', weeks: 4 },
        ]
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
    currentVisaExpiry: '',
    consultant: '',
    email: '',
    phone: '',
    courses: [createCourse('elicos')],
    extraCosts: createExtraCosts('Individual'),
    payments: [],
    notes: '*Data estimada de vencimento do visto a ser confirmada na carta de oferta.',
  }
}
