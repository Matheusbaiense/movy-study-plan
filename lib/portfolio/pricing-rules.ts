// lib/portfolio/pricing-rules.ts — Org-scoped CRUD for the agency rule layer (SPLIT 6A).
//
// `pricing_rules` is the configurable agency/promo layer consumed by the pure
// engine (`lib/calc/rules.ts`). Promotions are unified here (a promo = a rule with
// `effect=promo_rate_override` + a `[valid_from, valid_until]` window). Reads/writes
// are RLS-scoped to the current org; writes set `org_id` explicitly for the insert
// WITH CHECK policy. Soft-delete via `deleted_at` keeps the audit trail intact.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { PricingRule } from '../calc/rules'
import type { PricingRuleDraft, PricingRuleRow } from './types'
import { draftToInsert, draftToUpdate, isRuleActiveOn, rowToPricingRule } from './types.ts'

type Client = SupabaseClient<Database>

/** List every non-deleted pricing rule for the current org (admin UI), highest priority last. */
export async function listPricingRules(supabase: Client): Promise<PricingRuleRow[]> {
  const { data } = await supabase
    .from('pricing_rules')
    .select('*')
    .is('deleted_at', null)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })
  return data ?? []
}

/**
 * The rules currently IN FORCE, mapped to the engine's `PricingRule` shape — feed
 * this straight into `applyRulesToPlan`. Filters by `is_active` and the validity
 * window as of `onDate` (default now). Returns `[]` (engine no-op) when none apply.
 */
export async function getActiveRules(supabase: Client, onDate: Date = new Date()): Promise<PricingRule[]> {
  const rows = await listPricingRules(supabase)
  return rows.filter((row) => isRuleActiveOn(row, onDate)).map(rowToPricingRule)
}

/** Create a pricing rule for the given org. Returns the inserted row; throws on DB error. */
export async function createPricingRule(
  supabase: Client,
  orgId: string,
  draft: PricingRuleDraft,
  actorId?: string | null,
): Promise<PricingRuleRow> {
  const { data, error } = await supabase
    .from('pricing_rules')
    .insert(draftToInsert(orgId, draft, actorId))
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

/** Update a pricing rule (only the provided fields). Returns the updated row; throws on DB error. */
export async function updatePricingRule(
  supabase: Client,
  id: string,
  patch: Partial<PricingRuleDraft>,
  actorId?: string | null,
): Promise<PricingRuleRow> {
  const { data, error } = await supabase
    .from('pricing_rules')
    .update(draftToUpdate(patch, actorId))
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

/** Soft-delete a pricing rule (sets `deleted_at`). Throws on DB error. */
export async function deletePricingRule(supabase: Client, id: string, actorId?: string | null): Promise<void> {
  const { error } = await supabase
    .from('pricing_rules')
    .update({ deleted_at: new Date().toISOString(), updated_by: actorId ?? null })
    .eq('id', id)
  if (error) throw new Error(error.message)
}
