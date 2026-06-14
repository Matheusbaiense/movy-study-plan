// Computed snapshot types for the Movy calc engine (SPLIT 1).
//
// `computeProposal()` returns `ComputedTotals` — a PURE, integer-cents snapshot of a study
// plan. The server action persists this snapshot inside `study_plans.data` jsonb (under the
// `computed` key), versioned, so downstream consumers read a stored result instead of
// recalculating (P2 "snapshot, not recalculation"). Money is integer cents + currencyCode (P9).
//
// Lives in `lib/calc` (a leaf alongside `money.ts`) to avoid a cycle with
// `lib/study-plans/types.ts`, which references the engine indirectly.

import type { CurrencyCode } from './money'

/** Per-course breakdown, all monetary fields in integer cents. */
export interface ComputedPerCourse {
  courseId: string
  enrolmentCents: number
  tuitionCents: number
  materialCents: number
  scholarshipCents: number
  totalCents: number
  depositCents: number
  paymentBalanceCents: number
  /** Paid at closing: deposit normally, or full total when installments are barred. */
  upfrontCents: number
  installmentBalanceCents: number
  canInstallment: boolean
  studyWeeks: number
}

/** Whole-plan computed snapshot. All monetary fields are integer cents in `currencyCode`. */
export interface ComputedTotals {
  /** Snapshot schema version (COMPUTED_VERSION) so future readers can migrate safely. */
  version: number
  currencyCode: CurrencyCode
  coursesTotalCents: number
  extrasTotalCents: number
  grandTotalCents: number
  upfrontSchoolsCents: number
  installmentBalanceCents: number
  courseDepositsCents: number
  paymentBalanceCents: number
  studyWeeks: number
  holidayWeeks: number
  visaWeeks: number
  perCourse: ComputedPerCourse[]
}
