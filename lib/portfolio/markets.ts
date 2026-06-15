// lib/portfolio/markets.ts — Org-scoped CRUD for pricing markets (SPLIT 6A).
//
// A `market` groups countries (`country_codes`) so a price version can target a
// market instead of a single nationality. Reads/writes are RLS-scoped to the
// current org; writes set `org_id` explicitly. Soft-delete via `deleted_at`.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { Market } from './types'

type Client = SupabaseClient<Database>

export interface MarketDraft {
  name: string
  /** Short code (e.g. 'LATAM'). */
  code?: string | null
  /** ISO-3166 alpha-2 codes that belong to this market. */
  countryCodes?: string[]
}

/** List non-deleted markets for the current org, alphabetical. */
export async function listMarkets(supabase: Client): Promise<Market[]> {
  const { data } = await supabase
    .from('markets')
    .select('*')
    .is('deleted_at', null)
    .order('name', { ascending: true })
  return data ?? []
}

/** Create a market for the given org. Returns the inserted row; throws on DB error. */
export async function createMarket(
  supabase: Client,
  orgId: string,
  draft: MarketDraft,
  actorId?: string | null,
): Promise<Market> {
  const { data, error } = await supabase
    .from('markets')
    .insert({
      org_id: orgId,
      name: draft.name.trim() || 'Novo mercado',
      code: draft.code ?? null,
      country_codes: draft.countryCodes ?? [],
      created_by: actorId ?? null,
      updated_by: actorId ?? null,
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

/** Update a market (only the provided fields). Returns the updated row; throws on DB error. */
export async function updateMarket(
  supabase: Client,
  id: string,
  patch: Partial<MarketDraft>,
  actorId?: string | null,
): Promise<Market> {
  const update: Database['public']['Tables']['markets']['Update'] = { updated_by: actorId ?? null }
  if (patch.name !== undefined) update.name = patch.name.trim() || 'Novo mercado'
  if (patch.code !== undefined) update.code = patch.code
  if (patch.countryCodes !== undefined) update.country_codes = patch.countryCodes

  const { data, error } = await supabase.from('markets').update(update).eq('id', id).select('*').single()
  if (error) throw new Error(error.message)
  return data
}

/** Soft-delete a market (sets `deleted_at`). Throws on DB error. */
export async function deleteMarket(supabase: Client, id: string, actorId?: string | null): Promise<void> {
  const { error } = await supabase
    .from('markets')
    .update({ deleted_at: new Date().toISOString(), updated_by: actorId ?? null })
    .eq('id', id)
  if (error) throw new Error(error.message)
}
