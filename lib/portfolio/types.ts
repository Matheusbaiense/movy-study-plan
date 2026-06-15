// lib/portfolio/types.ts — Portfolio domain types + PURE mappers (SPLIT 6A).
//
// The portfolio is the normalized catalog that replaced `course_presets`
// (migration 011): institutions → campuses → courses → course_price_versions
// (+ markets, pricing_rules). Money lives in the DB as integer `*_in_cents`
// (P9/R1); this layer converts to legacy FLOAT dollars **at the border** so the
// existing editor (`StudyCourse`, still float) consumes it unchanged.
//
// This module is the leaf that holds the price snapshot shape, the `CourseSource`
// contract (§4 of the roadmap), and the DB↔domain mappers — all PURE so they are
// unit-testable without a Supabase client.

import type { Json, Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import type { CourseType, ExtraCost, StudentLocation, StudyCourse } from '../study-plans/types'
import type { AppliedAdjustment, PricingRule, RuleCondition, RuleEffect, RuleScope } from '../calc/rules'
import { centsToNumber } from '../calc/money.ts'
import { createCourse } from '../study-plans/defaults.ts'

// --- Table row/insert/update aliases (single source = generated types) ---------

export type Institution = Tables<'institutions'>
export type Campus = Tables<'campuses'>
export type Course = Tables<'courses'>
export type CoursePriceVersion = Tables<'course_price_versions'>
export type Market = Tables<'markets'>
export type PricingRuleRow = Tables<'pricing_rules'>

export type MarketInsert = TablesInsert<'markets'>
export type MarketUpdate = TablesUpdate<'markets'>
export type PricingRuleInsert = TablesInsert<'pricing_rules'>
export type PricingRuleUpdate = TablesUpdate<'pricing_rules'>

const COURSE_TYPES = new Set<CourseType>(['elicos', 'vet', 'he'])

/** Narrow the DB `courses.type` (typed as string) to our `CourseType` union. */
export function asCourseType(value: string): CourseType {
  return COURSE_TYPES.has(value as CourseType) ? (value as CourseType) : 'elicos'
}

// --- Course search options (what the editor's picker lists) --------------------

export interface CourseOption {
  /** `courses.id` — pass to `CourseSource.resolve`. */
  id: string
  type: CourseType
  name: string
  /** Institution name (maps 1:1 to the editor's `StudyCourse.provider`). */
  provider: string
  institutionId: string
  campusId: string | null
  campusName: string | null
  cricos: string | null
  englishLevel: string | null
  timetable: string
}

// --- Price snapshot (FLOAT dollars at the editor border) -----------------------

/**
 * A point-in-time price for a course, converted from integer cents to legacy
 * FLOAT dollars for the (still float) editor. This is the raw CATALOG truth — the
 * agency rule layer (promotions/discounts) is applied on top separately so the
 * snapshot itself stays a faithful record of the price version (P3 snapshot).
 */
export interface PriceSnapshot {
  priceVersionId: string
  currencyCode: string
  tuition: number
  ratePerWeek: number
  enrolmentFee: number
  materialFee: number
  hasMaterial: boolean
  scholarship: number
  depositWeeks: number
  paymentParts: number
  paymentFrequency: string
  nationality: string | null
  marketId: string | null
  validFrom: string
  validUntil: string | null
}

/** Convert an integer-cents price version (table row or RPC result) to a float snapshot. */
export function priceVersionToSnapshot(version: CoursePriceVersion): PriceSnapshot {
  return {
    priceVersionId: version.id,
    currencyCode: version.currency_code,
    tuition: centsToNumber(version.tuition_in_cents),
    ratePerWeek: centsToNumber(version.rate_per_week_in_cents),
    enrolmentFee: centsToNumber(version.enrolment_fee_in_cents),
    materialFee: centsToNumber(version.material_fee_in_cents),
    hasMaterial: version.has_material,
    scholarship: centsToNumber(version.scholarship_in_cents),
    depositWeeks: version.deposit_weeks,
    paymentParts: version.payment_parts,
    paymentFrequency: version.payment_frequency,
    nationality: version.nationality,
    marketId: version.market_id,
    validFrom: version.valid_from,
    validUntil: version.valid_until,
  }
}

export interface CourseLike {
  type: CourseType
  name: string
  /** Institution name. */
  provider: string
  timetable?: string | null
}

/**
 * Build an editor-ready `StudyCourse` from a course + its price snapshot. Starts
 * from `createCourse(type)` so segments/modules/defaults are valid, then overlays
 * the catalog identity and the (float) price fields. Pure: returns a new course.
 */
export function buildStudyCourse(course: CourseLike, snapshot: PriceSnapshot): StudyCourse {
  const base = createCourse(course.type)
  return {
    ...base,
    provider: course.provider,
    name: course.name,
    timetable: course.timetable || base.timetable,
    enrolmentFee: snapshot.enrolmentFee,
    tuition: snapshot.tuition,
    ratePerWeek: snapshot.ratePerWeek,
    materialFee: snapshot.materialFee,
    hasMaterial: snapshot.hasMaterial,
    scholarship: snapshot.scholarship,
    depositWeeks: snapshot.depositWeeks,
    paymentParts: snapshot.paymentParts,
    paymentFrequency: snapshot.paymentFrequency,
  }
}

// --- PortfolioCourseRef + CourseSource contract (roadmap §4) --------------------

/**
 * What the proposal records when a consultant picks a course from the portfolio
 * (roadmap §4). `snapshot` is the locked catalog price (float); `course` is the
 * editor-ready `StudyCourse` with the agency rule layer already baked in;
 * `adjustments`/`extras` explain what the rules added.
 */
export interface PortfolioCourseRef {
  courseId: string
  priceVersionId: string
  snapshot: PriceSnapshot
  /** ISO instant the price was resolved/locked. */
  takenAt: string
  /** Editor-ready course (snapshot + agency rules applied). */
  course: StudyCourse
  /** Agency-fee extra lines produced by the rules (empty when no rules fire). */
  extras: ExtraCost[]
  /** Explainable list of rule adjustments baked into `course`. */
  adjustments: AppliedAdjustment[]
}

export interface ResolveOptions {
  /** Student nationality (ISO-3166 alpha-2) — drives price resolution + nationality rules. */
  nationality?: string | null
  /** Resolve as of this date (ISO). Defaults to "now" on both the price and the rules. */
  onDate?: string
  /** Onshore/offshore — lets location-scoped rules fire at resolve time. */
  location?: StudentLocation
}

/**
 * Seam between the editor (SPLIT 4) and the portfolio (SPLIT 6A). The editor codes
 * against this interface; this module ships the portfolio-backed provider, so the
 * editor never reopens `StudyPlanEditor.tsx` to gain catalog support.
 */
export interface CourseSource {
  search(query: string): Promise<CourseOption[]>
  resolve(courseId: string, options?: ResolveOptions): Promise<PortfolioCourseRef | null>
}

// --- pricing_rules DB ↔ engine `PricingRule` mappers (PURE) --------------------

const RULE_SCOPES = new Set<RuleScope>(['org', 'institution', 'campus', 'course', 'type'])

function asRuleScope(value: string): RuleScope {
  return RULE_SCOPES.has(value as RuleScope) ? (value as RuleScope) : 'org'
}

/** Map a `pricing_rules` row to the engine's `PricingRule` (consumed by `applyRules`). */
export function rowToPricingRule(row: PricingRuleRow): PricingRule {
  return {
    id: row.id,
    scope: asRuleScope(row.scope),
    scopeId: row.scope_id,
    when: (row.conditions ?? {}) as unknown as RuleCondition,
    effect: row.effect as unknown as RuleEffect,
    priority: row.priority,
    isActive: row.is_active,
  }
}

/**
 * Is a rule in force on `onDate`? A rule is inactive if disabled, soft-deleted, or
 * outside its `[valid_from, valid_until]` window (promotions are unified into
 * `pricing_rules`, so the window also gates promos). Pure.
 */
export function isRuleActiveOn(
  row: Pick<PricingRuleRow, 'is_active' | 'deleted_at' | 'valid_from' | 'valid_until'>,
  onDate: Date = new Date(),
): boolean {
  if (!row.is_active || row.deleted_at) return false
  const at = onDate.getTime()
  if (row.valid_from && at < Date.parse(row.valid_from)) return false
  if (row.valid_until && at > Date.parse(row.valid_until)) return false
  return true
}

/** Admin-facing draft for creating/updating a pricing rule (camelCase + window). */
export interface PricingRuleDraft {
  scope: RuleScope
  scopeId?: string | null
  when: RuleCondition
  effect: RuleEffect
  priority?: number
  isActive?: boolean
  label?: string | null
  validFrom?: string | null
  validUntil?: string | null
}

/** Map a draft to a `pricing_rules` insert payload (org_id explicit for the WITH CHECK policy). */
export function draftToInsert(orgId: string, draft: PricingRuleDraft, actorId?: string | null): PricingRuleInsert {
  return {
    org_id: orgId,
    scope: draft.scope,
    scope_id: draft.scopeId ?? null,
    conditions: (draft.when ?? {}) as unknown as Json,
    effect: draft.effect as unknown as Json,
    priority: draft.priority ?? 0,
    is_active: draft.isActive ?? true,
    label: draft.label ?? null,
    valid_from: draft.validFrom ?? null,
    valid_until: draft.validUntil ?? null,
    created_by: actorId ?? null,
    updated_by: actorId ?? null,
  }
}

/** Map a partial draft to a `pricing_rules` update payload (only provided fields). */
export function draftToUpdate(patch: Partial<PricingRuleDraft>, actorId?: string | null): PricingRuleUpdate {
  const update: PricingRuleUpdate = { updated_by: actorId ?? null }
  if (patch.scope !== undefined) update.scope = patch.scope
  if (patch.scopeId !== undefined) update.scope_id = patch.scopeId
  if (patch.when !== undefined) update.conditions = patch.when as unknown as Json
  if (patch.effect !== undefined) update.effect = patch.effect as unknown as Json
  if (patch.priority !== undefined) update.priority = patch.priority
  if (patch.isActive !== undefined) update.is_active = patch.isActive
  if (patch.label !== undefined) update.label = patch.label
  if (patch.validFrom !== undefined) update.valid_from = patch.validFrom
  if (patch.validUntil !== undefined) update.valid_until = patch.validUntil
  return update
}

// --- Price version label + picker options (pure) --------------------------------

export type PriceVersionKind = 'country' | 'market' | 'default'

export interface PriceVersionLabel {
  kind: PriceVersionKind
  label: string
  scopeValue: string | null
}

function regionName(code: string): string {
  const upper = (code ?? '').toUpperCase()
  try {
    return new Intl.DisplayNames(['pt-BR'], { type: 'region' }).of(upper) ?? upper
  } catch {
    return upper
  }
}

/** Human label for a price version: País · X (most specific) > Mercado · Y > Normal · padrão. */
export function priceVersionLabel(
  version: Pick<CoursePriceVersion, 'nationality' | 'market_id'>,
  markets: Pick<Market, 'id' | 'name'>[] = [],
): PriceVersionLabel {
  if (version.nationality) {
    const code = version.nationality.toUpperCase()
    return { kind: 'country', label: `País · ${regionName(code)}`, scopeValue: code }
  }
  if (version.market_id) {
    const market = markets.find((m) => m.id === version.market_id)
    return { kind: 'market', label: `Mercado · ${market?.name ?? '—'}`, scopeValue: version.market_id }
  }
  return { kind: 'default', label: 'Normal · padrão', scopeValue: null }
}

export interface PricedOption {
  priceVersionId: string
  label: string
  kind: PriceVersionKind
  /** Float snapshot, ready for the editor (`buildStudyCourse`). */
  snapshot: PriceSnapshot
}

const PRICE_KIND_ORDER: Record<PriceVersionKind, number> = { default: 0, market: 1, country: 2 }

/** Map active price versions to ordered, labeled options for the editor's price picker. */
export function toPricedOptions(versions: CoursePriceVersion[], markets: Market[] = []): PricedOption[] {
  return versions
    .map((version) => {
      const labeled = priceVersionLabel(version, markets)
      return {
        priceVersionId: version.id,
        label: labeled.label,
        kind: labeled.kind,
        snapshot: priceVersionToSnapshot(version),
      }
    })
    .sort((a, b) => PRICE_KIND_ORDER[a.kind] - PRICE_KIND_ORDER[b.kind])
}
