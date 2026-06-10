export type CourseType = 'elicos' | 'vet' | 'he'
export type SegmentKind = 'study' | 'holiday'
export type ApplicantType = 'Individual' | 'Casal' | 'Família' | 'Single Parent'

export interface CourseSegment {
  id: string
  label: string
  kind: SegmentKind
  weeks: number
}

export interface StudyCourse {
  id: string
  type: CourseType
  provider: string
  name: string
  url: string
  timetable: string
  start: string
  enrolmentFee: number
  tuition: number
  ratePerWeek: number
  materialFee: number
  hasMaterial: boolean
  scholarship: number
  depositWeeks: number
  paymentParts: number
  paymentFrequency: string
  segments: CourseSegment[]
}

export interface ExtraCost {
  id: string
  item: string
  category: 'oshc' | 'visa' | 'admin' | 'medical' | 'other'
  amount: number
}

export interface PaymentItem {
  id: string
  item: string
  due: string
  amount: number
}

export interface StudyPlanData {
  student: string
  applicantType: ApplicantType
  currentVisaExpiry: string
  consultant: string
  email: string
  phone: string
  courses: StudyCourse[]
  extraCosts: ExtraCost[]
  payments: PaymentItem[]
  notes: string
}

export interface StudyPlanRow {
  id: string
  title: string
  student_name: string
  applicant_type: ApplicantType
  status: 'draft' | 'sent' | 'accepted' | 'archived'
  data: StudyPlanData
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
}
