// Calculator → Proposal bridge (pure). The standalone "Simulador" holds an ephemeral
// StudyPlanData with no contact and no DB row. When the consultant chooses to turn the
// calculation into a real proposal, this maps the ephemeral plan + the resolved contact
// into a clean seed for the `study_plans` insert. Pure (no I/O) so it stays unit-testable;
// the server action wraps the result with `computeProposal` (P2 snapshot, recomputed server-side).

import type { StudyPlanData } from './types'

export interface SeedContact {
  id: string | null
  fullName: string
  email: string | null
  phone: string | null
}

/**
 * Build the proposal seed from a calculator plan and the resolved contact.
 * - Student identity comes from the contact (single source of truth).
 * - Stale derived fields are stripped: `computed` (the action recomputes on the
 *   server), `options` (the simulador has no multi-option editor), and any
 *   leftover `contactRef` (replaced by the freshly resolved contact).
 * - Course mix, extra costs and student location/applicant type are preserved.
 * Immutable: returns a new object, never mutates the input.
 */
export function buildProposalSeed(data: StudyPlanData, contact: SeedContact): StudyPlanData {
  const { computed: _computed, options: _options, contactRef: _contactRef, ...rest } = data

  return {
    ...rest,
    student: contact.fullName,
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    courses: data.courses,
    extraCosts: data.extraCosts,
    payments: [],
    contactRef: {
      id: contact.id,
      fullName: contact.fullName,
      email: contact.email,
      phone: contact.phone,
    },
  }
}
