import type { ComputedTotals } from '../calc/types'
import type { Enums } from '../../types/supabase'

/**
 * Proposal lifecycle status (SPLIT 2). Sourced from the live DB enum
 * `study_plan_status` so the union stays in lockstep with migrations:
 *   draft → ready_review → approved_internal → sent → viewed → negotiating
 *        → accepted | rejected | expired | archived
 */
export type StudyPlanStatus = Enums<'study_plan_status'>

export type CourseType = 'elicos' | 'vet' | 'he'
export type SegmentKind = 'study' | 'holiday'
export type ApplicantType = 'Individual' | 'Casal' | 'Familia' | 'Single Parent'
export type StudentLocation = 'onshore' | 'offshore'
export type Timetable = 'Manha' | 'Tarde' | 'Noite'

export interface CourseSegment {
  id: string
  label: string
  kind: SegmentKind
  weeks: number
}

export interface ElicosModule {
  id: string
  name: string
  ratePerWeek: number
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
  modules?: ElicosModule[]
  studyWeeksBeforeHoliday?: number
  holidayWeeks?: number
  gapBeforeWeeks?: number
  paymentCadenceDays?: number
  /** Portfolio price version this course's price came from (SPLIT 4 picker); for reverse-impact. */
  priceVersionId?: string
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

/**
 * Lightweight, server-resolved reference to the linked CRM contact (SPLIT 2).
 * The proposal's working copy of student/email/phone still lives in
 * `StudyPlanData` until SPLIT 4 rewires the editor; this ref exposes the
 * canonical `contacts` row id so downstream code can follow the seam.
 */
export interface ContactRef {
  id: string | null
  fullName: string
  email: string | null
  phone: string | null
}

/**
 * A single comparable option inside a multi-option proposal (SPLIT 2).
 * Each option carries its own course mix and its own integer-cents snapshot
 * so the proposal can present "Option A vs Option B" without recomputing.
 */
export interface ProposalOption {
  id: string
  label: string
  courses: StudyCourse[]
  extraCosts?: ExtraCost[]
  recommended?: boolean
  /** Server-recomputed integer-cents snapshot for this option (P2/P3). */
  computed?: ComputedTotals
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
  studentLocation?: StudentLocation
  /** Show the holiday/timeline planning in the generated proposal. Default true. */
  includeHolidayPlanning?: boolean
  /**
   * Server-recomputed integer-cents snapshot, persisted on every save (SPLIT 1).
   * Read this stored result downstream instead of recalculating (P2). Optional because
   * legacy rows saved before SPLIT 1 won't have it until their next save.
   */
  computed?: ComputedTotals
  /**
   * Multi-option proposals (SPLIT 2). When present, the proposal renders these
   * comparable options; the top-level `courses` remains the primary/default mix.
   */
  options?: ProposalOption[]
  /** Server-resolved reference to the linked CRM contact (SPLIT 2). */
  contactRef?: ContactRef
}

export interface StudyPlanRow {
  id: string
  title: string
  student_name: string
  applicant_type: ApplicantType
  status: StudyPlanStatus
  data: StudyPlanData
  // Proposal-domain columns (SPLIT 2 / migration 010). Optional so legacy
  // call-sites that select a subset keep type-checking.
  contact_id?: string | null
  deal_id?: string | null
  currency_code?: string
  expires_at?: string | null
  accepted_at?: string | null
  deleted_at?: string | null
  external_id?: string | null
  idempotency_key?: string | null
  org_id?: string
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
}
