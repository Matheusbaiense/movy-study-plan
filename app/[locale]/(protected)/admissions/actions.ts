'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireEditor } from '@/lib/actions/auth'
import { logAuditWithClient } from '@/lib/api/audit'
import { toJson } from '@/lib/db/json'
import { revealCredential } from '@/lib/admissions/queries'
import { CONTACT_ROLES, DOC_TAGS, STREAMS } from '@/lib/admissions/types'

const ADMISSIONS_PAGE = '/[locale]/(protected)/admissions'

const documentSchema = z.object({
  label: z.string().min(1).max(300),
  tags: z.array(z.enum(DOC_TAGS)).default([]),
  note: z.string().max(500).optional(),
})

const contactSchema = z.object({
  name: z.string().max(160).optional(),
  role: z.enum(CONTACT_ROLES).optional(),
  email: z.string().max(200).optional(),
  phone: z.string().max(60).optional(),
})

const admissionSchema = z.object({
  id: z.string().uuid().optional(),
  institution_id: z.string().uuid(),
  enrolment_type: z.string().max(200).optional(),
  portal_url: z.string().max(500).optional(),
  streams: z.array(z.enum(STREAMS)).default([]),
  documents: z.array(documentSchema).default([]),
  contacts: z.array(contactSchema).default([]),
  notes: z.string().max(4000).optional(),
})

export type AdmissionInput = z.infer<typeof admissionSchema>

/** Create or update a school's admissions record (editor+). */
export async function upsertAdmissionAction(input: AdmissionInput): Promise<{ id: string }> {
  const parsed = admissionSchema.parse(input)
  const { supabase, profile: actor } = await requireEditor()

  const payload = {
    org_id: actor.org_id,
    institution_id: parsed.institution_id,
    enrolment_type: parsed.enrolment_type?.trim() || null,
    portal_url: parsed.portal_url?.trim() || null,
    streams: parsed.streams,
    documents: toJson(parsed.documents),
    contacts: toJson(parsed.contacts),
    notes: parsed.notes?.trim() || null,
    updated_by: actor.id,
  }

  let id = parsed.id
  if (id) {
    const { error } = await supabase.from('school_admissions').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { data, error } = await supabase
      .from('school_admissions')
      .insert({ ...payload, created_by: actor.id })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    id = data.id
  }

  await logAuditWithClient(supabase, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: parsed.id ? 'admission.updated' : 'admission.created',
    entityType: 'school_admission',
    entityId: id,
    orgId: actor.org_id,
    metadata: toJson({ institution_id: parsed.institution_id }),
  })
  revalidatePath(ADMISSIONS_PAGE, 'page')
  return { id: id! }
}

/** Soft-delete a school's admissions record (editor+; delete policy is admin+). */
export async function deleteAdmissionAction(id: string): Promise<void> {
  const { supabase, profile: actor } = await requireEditor()
  const { error } = await supabase
    .from('school_admissions')
    .update({ deleted_at: new Date().toISOString(), updated_by: actor.id })
    .eq('id', id)
  if (error) throw new Error(error.message)
  await logAuditWithClient(supabase, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'admission.deleted',
    entityType: 'school_admission',
    entityId: id,
    orgId: actor.org_id,
  })
  revalidatePath(ADMISSIONS_PAGE, 'page')
}

const newSchoolSchema = z.object({ name: z.string().min(1, 'Nome obrigatório').max(200) })

/**
 * Create a brand-new school (institution) AND its admissions record in one step
 * (editor+). Reuses an existing institution when the name already matches, so the
 * Portfolio catalog stays the single source of truth for schools. RLS on
 * `institutions` already allows editor+ inserts.
 */
export async function createSchoolWithAdmissionAction(name: string): Promise<{ id: string }> {
  const parsed = newSchoolSchema.parse({ name })
  const { supabase, profile: actor } = await requireEditor()
  const cleanName = parsed.name.trim()

  // Find an existing institution by name (case-insensitive); create it if absent.
  const { data: existingInst } = await supabase
    .from('institutions')
    .select('id')
    .ilike('name', cleanName)
    .is('deleted_at', null)
    .maybeSingle()

  let institutionId = existingInst?.id
  if (!institutionId) {
    const { data: inst, error: instErr } = await supabase
      .from('institutions')
      .insert({ org_id: actor.org_id, name: cleanName, country: 'AU', source: 'admissions', created_by: actor.id, updated_by: actor.id })
      .select('id')
      .single()
    if (instErr) throw new Error(instErr.message)
    institutionId = inst.id
    await logAuditWithClient(supabase, {
      actorId: actor.id, actorEmail: actor.email, action: 'institution.created',
      entityType: 'institution', entityId: institutionId, orgId: actor.org_id,
      metadata: toJson({ name: cleanName, via: 'admissions' }),
    })
  }

  // Reuse the admission if the institution already has one; otherwise create it.
  const { data: existingAdm } = await supabase
    .from('school_admissions')
    .select('id')
    .eq('institution_id', institutionId)
    .is('deleted_at', null)
    .maybeSingle()
  if (existingAdm) return { id: existingAdm.id }

  const { data: adm, error: admErr } = await supabase
    .from('school_admissions')
    .insert({ org_id: actor.org_id, institution_id: institutionId, created_by: actor.id, updated_by: actor.id })
    .select('id')
    .single()
  if (admErr) throw new Error(admErr.message)

  await logAuditWithClient(supabase, {
    actorId: actor.id, actorEmail: actor.email, action: 'admission.created',
    entityType: 'school_admission', entityId: adm.id, orgId: actor.org_id,
    metadata: toJson({ institution_id: institutionId, created_school: !existingInst }),
  })
  revalidatePath(ADMISSIONS_PAGE, 'page')
  return { id: adm.id }
}

const credentialSchema = z.object({
  admission_id: z.string().uuid(),
  login: z.string().max(200).optional(),
  password: z.string().max(200).optional(),
  label: z.string().max(160).optional(),
})

export type CredentialInput = z.infer<typeof credentialSchema>

/** Create or update the portal credential for an admission (editor+). */
export async function upsertCredentialAction(input: CredentialInput): Promise<void> {
  const parsed = credentialSchema.parse(input)
  const { supabase, profile: actor } = await requireEditor()

  const { error } = await supabase.from('school_admission_credentials').upsert(
    {
      org_id: actor.org_id,
      admission_id: parsed.admission_id,
      login: parsed.login?.trim() || null,
      password: parsed.password ?? null,
      label: parsed.label?.trim() || null,
      updated_by: actor.id,
      created_by: actor.id,
    },
    { onConflict: 'admission_id' },
  )
  if (error) throw new Error(error.message)

  await logAuditWithClient(supabase, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'admission.credential_saved',
    entityType: 'school_admission',
    entityId: parsed.admission_id,
    orgId: actor.org_id,
  })
  revalidatePath(ADMISSIONS_PAGE, 'page')
}

/**
 * Reveal the portal password (editor+). ALWAYS audits the reveal — this is the
 * one place the secret leaves the database.
 */
export async function revealPortalPasswordAction(
  admissionId: string,
): Promise<{ login: string | null; password: string | null }> {
  const { supabase, profile: actor } = await requireEditor()
  const cred = await revealCredential(supabase, admissionId)

  await logAuditWithClient(supabase, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'admissions_portal_revealed',
    entityType: 'school_admission',
    entityId: admissionId,
    orgId: actor.org_id,
  })

  return cred ?? { login: null, password: null }
}
