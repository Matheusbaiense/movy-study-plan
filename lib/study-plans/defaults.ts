import type { ApplicantType, CourseType, ExtraCost, StudyCourse, StudyPlanData } from './types'

export const COURSE_TYPES: Record<CourseType, { label: string; color: string }> = {
  elicos: { label: 'ELICOS', color: '#2563EB' },
  vet: { label: 'VET', color: '#7C3AED' },
  he: { label: 'Higher Ed', color: '#0891B2' },
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
