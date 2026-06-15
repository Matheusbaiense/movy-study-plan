// Proposal options (SPLIT 4 · fatia B) — pure, immutable helpers to manage the comparable
// options of a proposal (AllyHub-style "Opção 1..N" tabs). No UI, no persistence here: the
// editor owns state and calls these to build new option arrays. Each option carries its own
// course mix + extras + an integer-cents `computed` snapshot (P2/P9, woofed-shaped).

import type { ExtraCost, ProposalOption, StudyCourse, StudyPlanData } from './types'
import { computeProposal } from './calculations.ts'
import { uid } from './defaults.ts'

const MAX_OPTIONS = 5

/** Hard cap on comparable options (matches the AllyHub model). */
export const MAX_PROPOSAL_OPTIONS = MAX_OPTIONS

/** Fresh ids for a cloned course mix so options never share keys within one proposal. */
function cloneCourses(courses: StudyCourse[]): StudyCourse[] {
  return courses.map((course) => ({
    ...course,
    id: uid('course'),
    segments: course.segments.map((segment) => ({ ...segment, id: uid('seg') })),
    modules: course.modules?.map((module) => ({ ...module, id: uid('mod') })),
  }))
}

function cloneExtras(extras: ExtraCost[]): ExtraCost[] {
  return extras.map((extra) => ({ ...extra, id: uid('extra') }))
}

/** Build a new, empty (or seeded) option. `from` seeds the mix with fresh ids. */
export function createOption(
  label: string,
  from?: { courses?: StudyCourse[]; extraCosts?: ExtraCost[] },
): ProposalOption {
  return {
    id: uid('opt'),
    label,
    courses: cloneCourses(from?.courses ?? []),
    extraCosts: cloneExtras(from?.extraCosts ?? []),
    recommended: false,
  }
}

/** Clone an option (new id + fresh course/extra ids); appends "(cópia)" unless a label is given. */
export function duplicateOption(option: ProposalOption, label?: string): ProposalOption {
  return {
    id: uid('opt'),
    label: label ?? `${option.label} (cópia)`,
    courses: cloneCourses(option.courses),
    extraCosts: cloneExtras(option.extraCosts ?? []),
    recommended: false,
  }
}

/**
 * Return the option with its `computed` snapshot recalculated through the engine, threading the
 * plan-level context (applicant type, student location, etc.) that affects totals. Pure.
 */
export function withRecomputed(option: ProposalOption, plan: StudyPlanData): ProposalOption {
  const variant: StudyPlanData = { ...plan, courses: option.courses, extraCosts: option.extraCosts ?? [] }
  return { ...option, computed: computeProposal(variant) }
}

/** Mark exactly one option as recommended (clears the flag on the others). */
export function setRecommended(options: ProposalOption[], id: string): ProposalOption[] {
  return options.map((option) => ({ ...option, recommended: option.id === id }))
}

/** Whether another option can be added (cap reached counts the primary mix as option 1). */
export function canAddOption(optionsCount: number): boolean {
  // optionsCount = plan.options.length; +1 for the primary mix (Opção 1).
  return optionsCount + 1 < MAX_OPTIONS
}
