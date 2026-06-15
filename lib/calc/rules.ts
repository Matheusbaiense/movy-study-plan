// Pricing-rules engine (SPLIT 6A) — the configurable AGENCY/PROMO layer on top of
// the structural engine. It is a PURE PRE-PROCESSOR: given the courses a consultant
// picked and a set of rules, it returns adjusted courses + extra lines, which the
// existing `computeProposal` (SPLIT 1) then totals UNCHANGED.
//
// Why a pre-processor (not threaded into computeProposal): the structural rules
// (material by type, deposit logic, offshore<25 = no installment) already live in
// `calculations.ts` and are NOT agency-configurable. `pricing_rules` only adds the
// configurable layer that does not exist yet: promotions, discounts, agency fee/markup.
//
// **Empty ruleSet = no-op** (courses returned untouched, no extras) — identical to the
// current behavior, so turning the engine on is opt-in and safe.
//
// Money note: `StudyCourse` fields are still legacy float dollars (coerced to cents at
// the engine border in SPLIT 1). This layer stays in the course's native dollar units;
// the integer-cents conversion happens downstream in `computeProposal`.

import type { CourseType, ExtraCost, StudentLocation, StudyCourse, StudyPlanData } from '../study-plans/types'
import { courseStudyWeeks, courseTotal } from '../study-plans/calculations.ts'

export type RuleScope = 'org' | 'institution' | 'campus' | 'course' | 'type'

/** When a rule fires. Empty/absent fields mean "no constraint on that axis". */
export interface RuleCondition {
  courseType?: CourseType
  /** Inclusive lower bound on a course's STUDY weeks. */
  minWeeks?: number
  /** Inclusive upper bound on a course's STUDY weeks. */
  maxWeeks?: number
  applicantMode?: StudentLocation
  /** 1–12; matches the month of the course start date. */
  intakeMonth?: number
  /**
   * Student nationality (ISO-3166 alpha-2, e.g. 'BR'). When set, the rule only fires
   * for that nationality — for promos/discounts targeted at a market. Base price-by-
   * nationality is handled by the price_version, not here; this is the agency layer.
   */
  nationality?: string
}

export type RuleEffect =
  | { kind: 'promo_rate_override'; ratePerWeek: number }
  | { kind: 'discount_pct'; pct: number }
  | { kind: 'discount_fixed'; amount: number }
  | { kind: 'agency_fee'; amount: number; label?: string }
  | { kind: 'agency_markup_pct'; pct: number }

export interface PricingRule {
  id: string
  scope: RuleScope
  /** institution/campus/course id when the rule is scoped to one; null for org/type. */
  scopeId?: string | null
  when: RuleCondition
  effect: RuleEffect
  /** Lower priority applies first; ties keep input order. */
  priority?: number
  isActive?: boolean
}

export interface RuleContext {
  location?: StudentLocation
  /** Student nationality (ISO-3166 alpha-2), used to match nationality-scoped rules. */
  nationality?: string
  /** Resolve which scopes a course belongs to (institution/campus/course ids). */
  scopeIds?: { institutionId?: string; campusId?: string; courseId?: string }
}

export interface AppliedAdjustment {
  ruleId: string
  kind: RuleEffect['kind']
  explain: string
}

export interface ApplyRulesResult {
  course: StudyCourse
  extras: ExtraCost[]
  adjustments: AppliedAdjustment[]
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function startMonth(course: StudyCourse): number | undefined {
  if (!course.start) return undefined
  const m = Number.parseInt(course.start.slice(5, 7), 10)
  return Number.isFinite(m) ? m : undefined
}

/** Does a rule's scope target this course? `org`/`type` are global; the rest need a matching id. */
function scopeMatches(rule: PricingRule, ctx: RuleContext): boolean {
  if (rule.scope === 'org' || rule.scope === 'type') return true
  if (!rule.scopeId) return false
  const ids = ctx.scopeIds ?? {}
  if (rule.scope === 'institution') return ids.institutionId === rule.scopeId
  if (rule.scope === 'campus') return ids.campusId === rule.scopeId
  if (rule.scope === 'course') return ids.courseId === rule.scopeId
  return false
}

function conditionMatches(when: RuleCondition, course: StudyCourse, ctx: RuleContext): boolean {
  if (when.courseType && when.courseType !== course.type) return false
  const studyWeeks = courseStudyWeeks(course)
  if (typeof when.minWeeks === 'number' && studyWeeks < when.minWeeks) return false
  if (typeof when.maxWeeks === 'number' && studyWeeks > when.maxWeeks) return false
  if (when.applicantMode && when.applicantMode !== ctx.location) return false
  if (typeof when.intakeMonth === 'number' && when.intakeMonth !== startMonth(course)) return false
  if (when.nationality && when.nationality !== ctx.nationality) return false
  return true
}

/**
 * Apply the matching rules to a single course. Returns an immutable adjusted copy of
 * the course, any extra lines (agency fees), and an explainable list of what fired.
 * Order: by `priority` asc, then input order. Each effect is documented in `adjustments`.
 */
export function applyRulesToCourse(course: StudyCourse, rules: PricingRule[], ctx: RuleContext = {}): ApplyRulesResult {
  const adjustments: AppliedAdjustment[] = []
  const extras: ExtraCost[] = []
  let next: StudyCourse = { ...course }

  const matching = rules
    .filter((r) => r.isActive !== false && scopeMatches(r, ctx) && conditionMatches(r.when, next, ctx))
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))

  for (const rule of matching) {
    const e = rule.effect
    switch (e.kind) {
      case 'promo_rate_override': {
        if (next.type !== 'elicos') break
        const from = next.ratePerWeek
        next = { ...next, ratePerWeek: e.ratePerWeek }
        adjustments.push({ ruleId: rule.id, kind: e.kind, explain: `Promoção: rate AUD ${from}/sem → AUD ${e.ratePerWeek}/sem` })
        break
      }
      case 'agency_markup_pct': {
        const factor = 1 + e.pct / 100
        if (next.type === 'elicos') next = { ...next, ratePerWeek: round2(next.ratePerWeek * factor) }
        else next = { ...next, tuition: round2(next.tuition * factor) }
        adjustments.push({ ruleId: rule.id, kind: e.kind, explain: `Markup da agência: +${e.pct}% no valor do curso` })
        break
      }
      case 'discount_pct': {
        const add = round2((courseTotal(next) * e.pct) / 100)
        next = { ...next, scholarship: round2(next.scholarship + add) }
        adjustments.push({ ruleId: rule.id, kind: e.kind, explain: `Desconto ${e.pct}% (AUD ${add}) aplicado como bolsa` })
        break
      }
      case 'discount_fixed': {
        next = { ...next, scholarship: round2(next.scholarship + e.amount) }
        adjustments.push({ ruleId: rule.id, kind: e.kind, explain: `Desconto fixo AUD ${e.amount} aplicado como bolsa` })
        break
      }
      case 'agency_fee': {
        extras.push({
          id: `fee-${rule.id}`,
          item: e.label ?? 'Taxa de serviço da agência',
          category: 'admin',
          amount: e.amount,
        })
        adjustments.push({ ruleId: rule.id, kind: e.kind, explain: `Taxa da agência: AUD ${e.amount}` })
        break
      }
    }
  }

  return { course: next, extras, adjustments }
}

export interface ApplyRulesToPlanResult {
  plan: StudyPlanData
  adjustments: AppliedAdjustment[]
}

export interface ApplyRulesOptions {
  /** Student nationality (ISO-3166 alpha-2), from the linked contact — matches nationality rules. */
  nationality?: string
  /** Resolve the institution/campus/course ids a course maps to (for scoped rules). */
  resolveScopeIds?: (course: StudyCourse) => RuleContext['scopeIds']
}

/**
 * Apply rules across every course in a plan, collecting agency-fee extras into the
 * plan's `extraCosts`. Pure: returns a new plan (the inputs are not mutated). With an
 * empty `rules` array this returns an equivalent plan and no adjustments (no-op).
 */
export function applyRulesToPlan(
  plan: StudyPlanData,
  rules: PricingRule[],
  opts: ApplyRulesOptions = {},
): ApplyRulesToPlanResult {
  if (rules.length === 0) return { plan, adjustments: [] }

  const allAdjustments: AppliedAdjustment[] = []
  const addedExtras: ExtraCost[] = []

  const courses = plan.courses.map((course) => {
    const res = applyRulesToCourse(course, rules, {
      location: plan.studentLocation,
      nationality: opts.nationality,
      scopeIds: opts.resolveScopeIds?.(course),
    })
    allAdjustments.push(...res.adjustments)
    addedExtras.push(...res.extras)
    return res.course
  })

  return {
    plan: { ...plan, courses, extraCosts: [...plan.extraCosts, ...addedExtras] },
    adjustments: allAdjustments,
  }
}
