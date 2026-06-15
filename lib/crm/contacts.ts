// lib/crm/contacts.ts — CRM contacts seam (SPLIT 2)
//
// Org-scoped types and queries for the woofed-compatible `contacts` table.
// Logic lives here (thin server actions just orchestrate). RLS already scopes
// every read/write to `current_org_id()`, but writes still set `org_id`
// explicitly to satisfy the insert WITH CHECK policy and keep tenancy explicit.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Tables, TablesInsert, Json } from '@/types/supabase'

export type Contact = Tables<'contacts'>
export type ContactInsert = TablesInsert<'contacts'>

/** Any client typed against our Database (server session client in practice). */
type Client = SupabaseClient<Database>

export interface UpsertContactInput {
  /** Update this exact contact when provided; otherwise dedupe by email/phone. */
  id?: string | null
  orgId: string
  fullName: string
  email?: string | null
  phone?: string | null
  customAttributes?: Json
  metadata?: Json
  externalId?: string | null
  actorId?: string | null
}

/** Normalise an email to its canonical comparable form, or null when empty. */
export function normalizeEmail(email?: string | null): string | null {
  const v = (email ?? '').trim().toLowerCase()
  return v === '' ? null : v
}

/** Normalise a phone to a trimmed form, or null when empty. */
export function normalizePhone(phone?: string | null): string | null {
  const v = (phone ?? '').trim()
  return v === '' ? null : v
}

export async function getContactById(supabase: Client, id: string): Promise<Contact | null> {
  const { data } = await supabase.from('contacts').select('*').eq('id', id).maybeSingle()
  return data ?? null
}

export async function findContactByEmail(
  supabase: Client,
  orgId: string,
  email: string
): Promise<Contact | null> {
  const normalized = normalizeEmail(email)
  if (!normalized) return null
  const { data } = await supabase
    .from('contacts')
    .select('*')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .ilike('email', normalized)
    .limit(1)
    .maybeSingle()
  return data ?? null
}

export async function findContactByPhone(
  supabase: Client,
  orgId: string,
  phone: string
): Promise<Contact | null> {
  const normalized = normalizePhone(phone)
  if (!normalized) return null
  const { data } = await supabase
    .from('contacts')
    .select('*')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .eq('phone', normalized)
    .limit(1)
    .maybeSingle()
  return data ?? null
}

/** List non-deleted contacts for the current org (RLS-scoped), newest first. */
export async function listContacts(supabase: Client): Promise<Contact[]> {
  const { data } = await supabase
    .from('contacts')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  return data ?? []
}

/**
 * Insert-or-update a contact, deduping within the org by id, then email, then
 * phone. Returns the resolved contact. Throws on a hard DB error so callers can
 * surface it (per error-handling rules: exceptional cases throw).
 */
export async function upsertContact(supabase: Client, input: UpsertContactInput): Promise<Contact> {
  const email = normalizeEmail(input.email)
  const phone = normalizePhone(input.phone)
  const fullName = input.fullName.trim() || 'Sem nome'

  let existing: Contact | null = null
  if (input.id) {
    existing = await getContactById(supabase, input.id)
  }
  if (!existing && email) {
    existing = await findContactByEmail(supabase, input.orgId, email)
  }
  if (!existing && phone) {
    existing = await findContactByPhone(supabase, input.orgId, phone)
  }

  if (existing) {
    const { data, error } = await supabase
      .from('contacts')
      .update({
        full_name: fullName,
        email,
        phone,
        ...(input.customAttributes !== undefined ? { custom_attributes: input.customAttributes } : {}),
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
        ...(input.externalId !== undefined ? { external_id: input.externalId } : {}),
        updated_by: input.actorId ?? null,
      })
      .eq('id', existing.id)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  const insert: ContactInsert = {
    org_id: input.orgId,
    full_name: fullName,
    email,
    phone,
    created_by: input.actorId ?? null,
    updated_by: input.actorId ?? null,
  }
  if (input.customAttributes !== undefined) insert.custom_attributes = input.customAttributes
  if (input.metadata !== undefined) insert.metadata = input.metadata
  if (input.externalId !== undefined) insert.external_id = input.externalId

  const { data, error } = await supabase.from('contacts').insert(insert).select('*').single()
  if (error) throw new Error(error.message)
  return data
}

/**
 * Search contacts in the current org by name/email/phone (case-insensitive),
 * newest first. The term is sanitized for use inside a PostgREST `or()` filter.
 */
export async function searchContacts(supabase: Client, query: string, limit = 8): Promise<Contact[]> {
  const term = query.trim()
  if (!term) return []
  const safe = term.replace(/[,()%*]/g, ' ').trim()
  if (!safe) return []
  const { data } = await supabase
    .from('contacts')
    .select('*')
    .is('deleted_at', null)
    .or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`)
    .order('updated_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

/** Well-known keys inside `contacts.custom_attributes` (woofed-shaped; sync 1:1 to the CRM). */
export const CONTACT_ATTR = {
  NATIONALITY: 'nationality',
  LEAD_SOURCE: 'lead_source',
  PREFERRED_LANGUAGE: 'preferred_language',
} as const

function readStringAttr(custom: Json | null | undefined, key: string): string | null {
  if (custom && typeof custom === 'object' && !Array.isArray(custom)) {
    const value = (custom as Record<string, unknown>)[key]
    if (typeof value === 'string' && value.trim() !== '') return value
  }
  return null
}

/** Read the lead's nationality (ISO-3166 alpha-2) from `custom_attributes`, or null. */
export function getContactNationality(contact: { custom_attributes?: Json | null }): string | null {
  return readStringAttr(contact.custom_attributes, CONTACT_ATTR.NATIONALITY)
}

export interface LeadAttrs {
  nationality?: string | null
  leadSource?: string | null
  preferredLanguage?: string | null
}

/**
 * Build a `custom_attributes` object for a lead, merging onto `base`. Nationality is
 * trimmed + uppercased; others trimmed. A provided-but-empty value removes the key.
 * Keys absent from `attrs` are left untouched.
 */
export function buildContactAttributes(attrs: LeadAttrs, base: Json = {}): Json {
  const out: Record<string, unknown> =
    base && typeof base === 'object' && !Array.isArray(base) ? { ...(base as Record<string, unknown>) } : {}
  const apply = (key: string, raw: string | null | undefined, upper = false) => {
    if (raw === undefined) return
    const value = (raw ?? '').trim()
    if (value === '') delete out[key]
    else out[key] = upper ? value.toUpperCase() : value
  }
  apply(CONTACT_ATTR.NATIONALITY, attrs.nationality, true)
  apply(CONTACT_ATTR.LEAD_SOURCE, attrs.leadSource)
  apply(CONTACT_ATTR.PREFERRED_LANGUAGE, attrs.preferredLanguage)
  return out as Json
}
