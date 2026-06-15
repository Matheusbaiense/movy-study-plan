// Scenario comparison (SPLIT 6A engine extension) — pure helpers to compute several
// variants of a proposal side by side (e.g. 6/8/12 months) for the SPLIT 4 UI.
// No UI state here: the caller builds the plan variants; this just totals each one
// through the single-source engine (`computeProposal`).

import type { StudyPlanData } from '../study-plans/types'
import type { ComputedTotals } from './types'
import { computeProposal } from '../study-plans/calculations.ts'

export interface ScenarioInput {
  label: string
  plan: StudyPlanData
}

export interface ScenarioResult {
  label: string
  computed: ComputedTotals
}

/** Total each scenario's plan through the engine; returns one snapshot per scenario. */
export function computeScenarios(scenarios: ScenarioInput[]): ScenarioResult[] {
  return scenarios.map(({ label, plan }) => ({ label, computed: computeProposal(plan) }))
}

/**
 * Build a plan variant whose first STUDY segment is resized to `targetWeeks` (keeping
 * everything else equal) — a convenience for "same course, N vs M weeks" comparisons.
 * Returns a new plan; the input is not mutated. If there is no study segment, returns
 * the plan unchanged.
 */
export function withFirstCourseStudyWeeks(plan: StudyPlanData, targetWeeks: number): StudyPlanData {
  const courses = plan.courses.map((course, courseIndex) => {
    if (courseIndex !== 0) return course
    let resized = false
    const segments = course.segments.map((segment) => {
      if (resized || segment.kind !== 'study') return segment
      resized = true
      return { ...segment, weeks: Math.max(0, Math.round(targetWeeks)) }
    })
    return { ...course, segments }
  })
  return { ...plan, courses }
}
