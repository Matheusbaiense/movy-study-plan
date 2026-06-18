// lib/admissions/queries.ts — Org-scoped reads/writes for the admissions sector.
//
// Mirrors `lib/portfolio/queries.ts`: every function takes a Database-typed
// client and relies on per-org RLS to scope rows. The portal PASSWORD is never
// selected here except by `revealCredential` — list/detail projections only ever
// learn whether a credential exists and its login.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import {
  parseContacts,
  parseDocuments,
  parseStreams,
  type SchoolAdmission,
  type SchoolAdmissionView,
} from './types'

type Client = SupabaseClient<Database>

type AdmissionWithInstitution = SchoolAdmission & {
  institutions: { id: string; name: string; country: string | null; logo_url: string | null } | null
}

function toView(
  row: AdmissionWithInstitution,
  cred: { admission_id: string; login: string | null } | undefined,
): SchoolAdmissionView {
  return {
    ...row,
    institution: row.institutions
      ? {
          id: row.institutions.id,
          name: row.institutions.name,
          country: row.institutions.country,
          logo_url: row.institutions.logo_url,
        }
      : null,
    documentsParsed: parseDocuments(row.documents),
    contactsParsed: parseContacts(row.contacts),
    streamsTyped: parseStreams(row.streams),
    hasCredential: !!cred,
    credentialLogin: cred?.login ?? null,
  }
}

/** List non-deleted admissions for the current org (institution joined), A→Z. */
export async function listAdmissions(supabase: Client): Promise<SchoolAdmissionView[]> {
  const { data } = await supabase
    .from('school_admissions')
    .select('*, institutions(id, name, country, logo_url)')
    .is('deleted_at', null)
  const rows = (data as AdmissionWithInstitution[] | null) ?? []
  if (rows.length === 0) return []

  // One extra round-trip for credential presence (login only, never password).
  const { data: creds } = await supabase
    .from('school_admission_credentials')
    .select('admission_id, login')
    .in(
      'admission_id',
      rows.map((r) => r.id),
    )
  const credByAdmission = new Map((creds ?? []).map((c) => [c.admission_id, c]))

  return rows
    .map((r) => toView(r, credByAdmission.get(r.id)))
    .sort((a, b) => (a.institution?.name ?? '').localeCompare(b.institution?.name ?? ''))
}

/** Fetch a single admission (institution joined + credential presence) by id. */
export async function getAdmissionById(supabase: Client, id: string): Promise<SchoolAdmissionView | null> {
  const { data } = await supabase
    .from('school_admissions')
    .select('*, institutions(id, name, country, logo_url)')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()
  if (!data) return null

  const { data: cred } = await supabase
    .from('school_admission_credentials')
    .select('admission_id, login')
    .eq('admission_id', id)
    .maybeSingle()

  return toView(data as AdmissionWithInstitution, cred ?? undefined)
}

/** Institutions that do NOT yet have an admissions record (for the "add" picker). */
export async function listInstitutionsWithoutAdmission(
  supabase: Client,
): Promise<{ id: string; name: string }[]> {
  const [{ data: institutions }, { data: admissions }] = await Promise.all([
    supabase.from('institutions').select('id, name').is('deleted_at', null).order('name'),
    supabase.from('school_admissions').select('institution_id').is('deleted_at', null),
  ])
  const taken = new Set((admissions ?? []).map((a) => a.institution_id))
  return (institutions ?? []).filter((i) => !taken.has(i.id))
}

/**
 * Reveal the portal password for an admission. SELECT is RLS-gated to editor+;
 * callers MUST audit. Returns `{ login, password }` or null when absent.
 */
export async function revealCredential(
  supabase: Client,
  admissionId: string,
): Promise<{ login: string | null; password: string | null } | null> {
  const { data } = await supabase
    .from('school_admission_credentials')
    .select('login, password')
    .eq('admission_id', admissionId)
    .maybeSingle()
  return data ?? null
}
