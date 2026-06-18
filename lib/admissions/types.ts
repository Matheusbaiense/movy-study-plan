// lib/admissions/types.ts — Admissions domain types + PURE mappers.
//
// The admissions sector stores one record per partner school, anchored to a
// portfolio `institution`. Document checklists and contacts are typed JSONB
// arrays; this module owns their shape + normalization so the rest of the app
// (and the unit tests) never touches raw jsonb. All functions here are PURE —
// no Supabase client — so they are testable in isolation.

import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type SchoolAdmission = Tables<'school_admissions'>
export type SchoolAdmissionInsert = TablesInsert<'school_admissions'>
export type SchoolAdmissionUpdate = TablesUpdate<'school_admissions'>
export type SchoolAdmissionCredential = Tables<'school_admission_credentials'>

// --- Enumerations (kept as string unions, validated at the border) ------------

export const STREAMS = ['english', 'vet', 'he'] as const
export type Stream = (typeof STREAMS)[number]

export const DOC_TAGS = ['all', 'visa', 'english', 'vet', 'he', 'package', 'couple'] as const
export type DocTag = (typeof DOC_TAGS)[number]

export const CONTACT_ROLES = ['admissions', 'marketing', 'comercial', 'other'] as const
export type ContactRole = (typeof CONTACT_ROLES)[number]

export interface AdmissionDocument {
  label: string
  tags: DocTag[]
  note?: string
}

export interface AdmissionContact {
  name?: string
  role?: ContactRole
  email?: string
  phone?: string
}

/** A read-model: admission row joined with its institution + a credential flag. */
export interface SchoolAdmissionView extends SchoolAdmission {
  institution: { id: string; name: string; country: string | null; logo_url: string | null } | null
  documentsParsed: AdmissionDocument[]
  contactsParsed: AdmissionContact[]
  streamsTyped: Stream[]
  /** Whether a portal credential exists (NOT the password). */
  hasCredential: boolean
  credentialLogin: string | null
}

// --- PURE normalizers (jsonb/unknown → typed domain) --------------------------

const isStream = (v: unknown): v is Stream => STREAMS.includes(v as Stream)
const isDocTag = (v: unknown): v is DocTag => DOC_TAGS.includes(v as DocTag)
const isContactRole = (v: unknown): v is ContactRole => CONTACT_ROLES.includes(v as ContactRole)

/** Coerce an unknown jsonb value into a clean AdmissionDocument[] (drops junk). */
export function parseDocuments(value: unknown): AdmissionDocument[] {
  if (!Array.isArray(value)) return []
  const out: AdmissionDocument[] = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    const label = typeof r.label === 'string' ? r.label.trim() : ''
    if (!label) continue
    const tags = Array.isArray(r.tags) ? r.tags.filter(isDocTag) : []
    const note = typeof r.note === 'string' && r.note.trim() ? r.note.trim() : undefined
    out.push(note ? { label, tags, note } : { label, tags })
  }
  return out
}

/** Coerce an unknown jsonb value into a clean AdmissionContact[] (drops empties). */
export function parseContacts(value: unknown): AdmissionContact[] {
  if (!Array.isArray(value)) return []
  const out: AdmissionContact[] = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    const c: AdmissionContact = {}
    if (typeof r.name === 'string' && r.name.trim()) c.name = r.name.trim()
    if (isContactRole(r.role)) c.role = r.role
    if (typeof r.email === 'string' && r.email.trim()) c.email = r.email.trim()
    if (typeof r.phone === 'string' && r.phone.trim()) c.phone = r.phone.trim()
    if (c.name || c.email || c.phone) out.push(c)
  }
  return out
}

/** Coerce an unknown streams array into the typed union (drops junk, dedupes). */
export function parseStreams(value: unknown): Stream[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<Stream>()
  for (const v of value) if (isStream(v)) seen.add(v)
  return [...seen]
}
