'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { logAuditWithClient } from '@/lib/api/audit'
import { requireEditor, requireAdmin } from '@/lib/actions/auth'
import { toJson, fromJson } from '@/lib/db/json'
import { createBlankStudyPlan } from '@/lib/study-plans/defaults'
import { computeProposal } from '@/lib/study-plans/calculations'
import { upsertContact as upsertContactRecord, searchContacts } from '@/lib/crm/contacts'
import type { Contact } from '@/lib/crm/contacts'
import type { StudyPlanData, StudyPlanStatus, StudentLocation } from '@/lib/study-plans/types'
import { createPortfolioCourseSource } from '@/lib/portfolio/course-source'
import type { CourseOption, PortfolioCourseRef, PricedOption } from '@/lib/portfolio/types'
import type { Database, Json, Enums } from '@/types/supabase'
import { Constants } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

type Client = SupabaseClient<Database>

// Recompute the integer-cents snapshot on the server and persist it under
// `data.computed` (SPLIT 1). No schema migration: the snapshot lives inside the
// existing jsonb column. Legacy float inputs are coerced to cents at the engine border.
function withComputed(data: StudyPlanData): StudyPlanData {
  return { ...data, computed: computeProposal(data) }
}

/** Narrow an arbitrary string to the live `study_plan_status` enum union. */
function isStudyPlanStatus(value: string): value is StudyPlanStatus {
  return (Constants.public.Enums.study_plan_status as readonly string[]).includes(value)
}


interface ProposalEventInput {
  orgId: string
  studyPlanId: string
  actorId: string
  kind: string
  title?: string | null
  contactId?: string | null
  metadata?: Json
}

/**
 * Append an entry to the proposal timeline (SPLIT 2). Best-effort: a failure to
 * record the event must never break the primary mutation (same philosophy as
 * audit logging). `org_id` is set explicitly to satisfy the insert RLS policy.
 */
async function emitProposalEvent(supabase: Client, input: ProposalEventInput): Promise<void> {
  try {
    await supabase.from('proposal_events').insert({
      org_id: input.orgId,
      study_plan_id: input.studyPlanId,
      actor_id: input.actorId,
      contact_id: input.contactId ?? null,
      kind: input.kind,
      title: input.title ?? null,
      from_me: true,
      metadata: input.metadata ?? {},
    })
  } catch {
    // Timeline failures must not break the primary operation.
  }
}

function revalidateStudyPlans(locale?: string) {
  revalidatePath('/[locale]/(protected)/study-plans', 'page')
  revalidatePath('/[locale]/(protected)/study-plans/[id]', 'page')
  if (locale) revalidatePath(`/${locale}/study-plans`)
}

export async function createStudyPlan(locale = 'pt') {
  const { supabase, user, profile } = await requireEditor()
  const data = withComputed(createBlankStudyPlan())

  const { data: plan, error } = await supabase
    .from('study_plans')
    .insert({
      title: 'Nova cotação',
      student_name: data.student,
      applicant_type: data.applicantType,
      status: 'draft',
      data: toJson(data),
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  if (!plan) throw new Error('Failed to create study plan')

  await emitProposalEvent(supabase, {
    orgId: profile.org_id,
    studyPlanId: plan.id,
    actorId: user.id,
    kind: 'created',
    metadata: { student: data.student },
  })

  await logAuditWithClient(supabase, {
    actorId: user.id,
    actorEmail: profile.email,
    action: 'study_plan.create',
    entityType: 'study_plans',
    entityId: plan.id,
    metadata: { student: data.student, applicantType: data.applicantType },
  })

  revalidatePath(`/${locale}/study-plans`)
  redirect(`/${locale}/study-plans/${plan.id}`)
}

export async function updateStudyPlan(id: string, data: StudyPlanData, status = 'draft') {
  const { supabase, user, profile } = await requireEditor()
  const title = data.student ? `Cotação - ${data.student}` : 'Cotação sem estudante'
  // Server-side recompute: ignore any client-sent `computed` and persist the
  // authoritative snapshot derived from the submitted plan inputs.
  const persisted = withComputed(data)
  const nextStatus: StudyPlanStatus = isStudyPlanStatus(status) ? status : 'draft'

  const { error } = await supabase
    .from('study_plans')
    .update({
      title,
      student_name: data.student,
      applicant_type: data.applicantType,
      status: nextStatus,
      data: toJson(persisted),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('org_id', profile.org_id)

  if (error) throw new Error(error.message)

  await logAuditWithClient(supabase, {
    actorId: user.id,
    actorEmail: profile.email,
    action: 'study_plan.update',
    entityType: 'study_plans',
    entityId: id,
    metadata: { student: data.student, applicantType: data.applicantType, status: nextStatus },
  })

  revalidatePath('/[locale]/(protected)/study-plans', 'page')
  revalidatePath('/[locale]/(protected)/study-plans/[id]', 'page')
}

/**
 * Duplicate a proposal (SPLIT 2). Copies inputs + contact link into a fresh
 * draft, re-snapshots server-side, and records a `duplicated` timeline event on
 * the new proposal. Returns the new id. Editor+ only.
 */
export async function duplicateStudyPlan(id: string, locale = 'pt'): Promise<{ id: string }> {
  const { supabase, user, profile } = await requireEditor()

  const { data: source, error: srcErr } = await supabase
    .from('study_plans')
    .select('title, student_name, applicant_type, data, contact_id, currency_code')
    .eq('id', id)
    .single()

  if (srcErr) throw new Error(srcErr.message)
  if (!source) throw new Error('Study plan not found')

  const persisted = withComputed(fromJson<StudyPlanData>(source.data))

  const { data: plan, error } = await supabase
    .from('study_plans')
    .insert({
      title: `${source.title} (cópia)`,
      student_name: source.student_name,
      applicant_type: source.applicant_type,
      status: 'draft',
      data: toJson(persisted),
      contact_id: source.contact_id,
      currency_code: source.currency_code,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  if (!plan) throw new Error('Failed to duplicate study plan')

  await emitProposalEvent(supabase, {
    orgId: profile.org_id,
    studyPlanId: plan.id,
    actorId: user.id,
    contactId: source.contact_id,
    kind: 'duplicated',
    metadata: { source_id: id },
  })

  await logAuditWithClient(supabase, {
    actorId: user.id,
    actorEmail: profile.email,
    action: 'study_plan.duplicate',
    entityType: 'study_plans',
    entityId: plan.id,
    metadata: { source_id: id },
  })

  revalidateStudyPlans(locale)
  return { id: plan.id }
}

/**
 * Change a proposal's lifecycle status (SPLIT 2). Validates against the live
 * enum, stamps `accepted_at` on acceptance, and records a `status_change`
 * timeline event. Editor+ only.
 */
export async function changeStudyPlanStatus(id: string, status: string, locale = 'pt') {
  const { supabase, user, profile } = await requireEditor()
  if (!isStudyPlanStatus(status)) throw new Error(`Invalid status: ${status}`)

  const patch: {
    status: Enums<'study_plan_status'>
    updated_by: string
    updated_at: string
    accepted_at?: string | null
  } = {
    status,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }
  if (status === 'accepted') patch.accepted_at = new Date().toISOString()

  const { error } = await supabase.from('study_plans').update(patch).eq('id', id).eq('org_id', profile.org_id)
  if (error) throw new Error(error.message)

  await emitProposalEvent(supabase, {
    orgId: profile.org_id,
    studyPlanId: id,
    actorId: user.id,
    kind: 'status_change',
    metadata: { to: status },
  })

  await logAuditWithClient(supabase, {
    actorId: user.id,
    actorEmail: profile.email,
    action: 'study_plan.status_change',
    entityType: 'study_plans',
    entityId: id,
    metadata: { to: status },
  })

  revalidateStudyPlans(locale)
}

/** Archive a proposal (status → archived). Editor+ only. */
export async function archiveStudyPlan(id: string, locale = 'pt') {
  return changeStudyPlanStatus(id, 'archived', locale)
}

/**
 * Soft-delete a proposal (SPLIT 2 / P7): stamps `deleted_at`. Recoverable via
 * `restoreStudyPlan`. Editor+ only.
 */
export async function softDeleteStudyPlan(id: string, locale = 'pt') {
  const { supabase, user, profile } = await requireEditor()

  const { error } = await supabase
    .from('study_plans')
    .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)
    .eq('org_id', profile.org_id)

  if (error) throw new Error(error.message)

  await emitProposalEvent(supabase, {
    orgId: profile.org_id,
    studyPlanId: id,
    actorId: user.id,
    kind: 'deleted',
  })

  await logAuditWithClient(supabase, {
    actorId: user.id,
    actorEmail: profile.email,
    action: 'study_plan.soft_delete',
    entityType: 'study_plans',
    entityId: id,
  })

  revalidateStudyPlans(locale)
}

/** Restore a soft-deleted proposal (clears `deleted_at`). Editor+ only. */
export async function restoreStudyPlan(id: string, locale = 'pt') {
  const { supabase, user, profile } = await requireEditor()

  const { error } = await supabase
    .from('study_plans')
    .update({ deleted_at: null, updated_by: user.id })
    .eq('id', id)
    .eq('org_id', profile.org_id)

  if (error) throw new Error(error.message)

  await emitProposalEvent(supabase, {
    orgId: profile.org_id,
    studyPlanId: id,
    actorId: user.id,
    kind: 'restored',
  })

  await logAuditWithClient(supabase, {
    actorId: user.id,
    actorEmail: profile.email,
    action: 'study_plan.restore',
    entityType: 'study_plans',
    entityId: id,
  })

  revalidateStudyPlans(locale)
}

/**
 * Permanently delete a proposal (admin-only, P7). Its `proposal_events` cascade
 * away at the DB level, so the durable record of the hard delete is the audit
 * log. Does not redirect — callable from a trash/list view.
 */
export async function hardDeleteStudyPlan(id: string, locale = 'pt') {
  const { supabase, user, profile } = await requireAdmin()

  const { error } = await supabase.from('study_plans').delete().eq('id', id).eq('org_id', profile.org_id)
  if (error) throw new Error(error.message)

  await logAuditWithClient(supabase, {
    actorId: user.id,
    actorEmail: profile.email,
    action: 'study_plan.hard_delete',
    entityType: 'study_plans',
    entityId: id,
  })

  revalidateStudyPlans(locale)
}

export type BulkStudyPlanOp = 'archive' | 'soft_delete' | 'restore'

export interface BulkResult {
  ok: boolean
  count: number
  error?: string
}

/**
 * Apply a lifecycle op to many proposals in a single actor session (SPLIT 3).
 * Resolves the actor once (not per id), emits a timeline event per proposal,
 * writes one audit row, and revalidates once. Returns a result instead of
 * throwing so the list UI can surface a toast. Editor+ only.
 */
export async function bulkStudyPlanAction(
  ids: string[],
  op: BulkStudyPlanOp,
  locale = 'pt'
): Promise<BulkResult> {
  const unique = Array.from(new Set(ids)).filter(Boolean)
  if (unique.length === 0) return { ok: true, count: 0 }

  try {
    const { supabase, user, profile } = await requireEditor()
    const stamp = new Date().toISOString()

    for (const id of unique) {
      const patch =
        op === 'archive'
          ? { status: 'archived' as Enums<'study_plan_status'>, updated_by: user.id, updated_at: stamp }
          : op === 'soft_delete'
            ? { deleted_at: stamp, updated_by: user.id }
            : { deleted_at: null, updated_by: user.id }

      const { error } = await supabase.from('study_plans').update(patch).eq('id', id).eq('org_id', profile.org_id)
      if (error) throw new Error(error.message)

      await emitProposalEvent(supabase, {
        orgId: profile.org_id,
        studyPlanId: id,
        actorId: user.id,
        kind: op === 'archive' ? 'status_change' : op === 'soft_delete' ? 'deleted' : 'restored',
        metadata: { bulk: true, ...(op === 'archive' ? { to: 'archived' } : {}) },
      })
    }

    await logAuditWithClient(supabase, {
      actorId: user.id,
      actorEmail: profile.email,
      action: `study_plan.bulk_${op}`,
      entityType: 'study_plans',
      entityId: unique[0],
      metadata: { ids: unique, count: unique.length },
    })

    revalidateStudyPlans(locale)
    return { ok: true, count: unique.length }
  } catch (e) {
    return { ok: false, count: 0, error: e instanceof Error ? e.message : 'Erro inesperado' }
  }
}

export interface UpsertContactActionInput {
  id?: string | null
  fullName: string
  email?: string | null
  phone?: string | null
  customAttributes?: Json
  metadata?: Json
  externalId?: string | null
  /** When provided, links the resolved contact to this proposal + emits an event. */
  studyPlanId?: string | null
}

/**
 * Create or update a CRM contact (SPLIT 2) and, when `studyPlanId` is given,
 * link it to the proposal and record a `contact_linked` timeline event.
 * Returns the resolved contact id. Editor+ only.
 */
export async function upsertContact(
  input: UpsertContactActionInput,
  locale = 'pt'
): Promise<{ id: string }> {
  const { supabase, user, profile } = await requireEditor()

  const contact = await upsertContactRecord(supabase, {
    id: input.id,
    orgId: profile.org_id,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    customAttributes: input.customAttributes,
    metadata: input.metadata,
    externalId: input.externalId,
    actorId: user.id,
  })

  if (input.studyPlanId) {
    const { error } = await supabase
      .from('study_plans')
      .update({ contact_id: contact.id, updated_by: user.id })
      .eq('id', input.studyPlanId)
      .eq('org_id', profile.org_id)
    if (error) throw new Error(error.message)

    await emitProposalEvent(supabase, {
      orgId: profile.org_id,
      studyPlanId: input.studyPlanId,
      actorId: user.id,
      contactId: contact.id,
      kind: 'contact_linked',
      metadata: { contact_id: contact.id },
    })
  }

  await logAuditWithClient(supabase, {
    actorId: user.id,
    actorEmail: profile.email,
    action: 'contact.upsert',
    entityType: 'contacts',
    entityId: contact.id,
    metadata: { study_plan_id: input.studyPlanId ?? null },
  })

  revalidateStudyPlans(locale)
  return { id: contact.id }
}

export interface ContactPick {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  nationality: string | null
}

function toContactPick(contact: Contact): ContactPick {
  const custom = contact.custom_attributes
  const nationality =
    custom && typeof custom === 'object' && !Array.isArray(custom)
      ? ((custom as Record<string, unknown>).nationality as string | undefined) ?? null
      : null
  return { id: contact.id, fullName: contact.full_name, email: contact.email, phone: contact.phone, nationality }
}

/** Typeahead for the "passo 0" modal. Editor+ only; org-scoped via RLS. */
export async function searchContactsAction(query: string): Promise<ContactPick[]> {
  const { supabase } = await requireEditor()
  const rows = await searchContacts(supabase, query)
  return rows.map(toContactPick)
}

/**
 * Create a draft proposal already linked to a contact (the "passo 0" flow).
 * Mirrors the contact's name/email/phone into the plan's working copy; the
 * nationality stays on the contact (read at price-resolve time). Redirects to
 * the editor. Editor+ only.
 */
export async function createProposalForContact(contactId: string, locale = 'pt') {
  const { supabase, user, profile } = await requireEditor()

  const { data: contact, error: contactErr } = await supabase
    .from('contacts')
    .select('id, full_name, email, phone')
    .eq('id', contactId)
    .single()
  if (contactErr) throw new Error(contactErr.message)
  if (!contact) throw new Error('Contact not found')

  const data = withComputed({
    ...createBlankStudyPlan(),
    student: contact.full_name,
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    contactRef: { id: contact.id, fullName: contact.full_name, email: contact.email, phone: contact.phone },
  })

  const { data: plan, error } = await supabase
    .from('study_plans')
    .insert({
      title: `Cotação - ${contact.full_name}`,
      student_name: contact.full_name,
      applicant_type: data.applicantType,
      status: 'draft',
      data: toJson(data),
      contact_id: contact.id,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  if (!plan) throw new Error('Failed to create study plan')

  await emitProposalEvent(supabase, {
    orgId: profile.org_id,
    studyPlanId: plan.id,
    actorId: user.id,
    contactId: contact.id,
    kind: 'created',
    metadata: { student: contact.full_name, from_contact: true },
  })

  await logAuditWithClient(supabase, {
    actorId: user.id,
    actorEmail: profile.email,
    action: 'study_plan.create',
    entityType: 'study_plans',
    entityId: plan.id,
    metadata: { contact_id: contact.id, student: contact.full_name },
  })

  revalidatePath(`/${locale}/study-plans`)
  redirect(`/${locale}/study-plans/${plan.id}`)
}

/** Search the portfolio catalog for courses (picker typeahead). Editor+ only. */
export async function searchCoursesAction(query: string): Promise<CourseOption[]> {
  const { supabase } = await requireEditor()
  if (!query.trim()) return []
  return createPortfolioCourseSource(supabase).search(query)
}

/** Resolve a catalog course to a price snapshot + editor-ready course, by nationality. Editor+ only. */
export async function resolveCourseAction(
  courseId: string,
  opts: { nationality?: string | null; location?: StudentLocation } = {},
): Promise<PortfolioCourseRef | null> {
  const { supabase } = await requireEditor()
  return createPortfolioCourseSource(supabase).resolve(courseId, {
    nationality: opts.nationality ?? undefined,
    location: opts.location,
  })
}

/** List the available prices for a catalog course (Normal/Mercado/País) for the override selector. */
export async function listCoursePricesAction(courseId: string): Promise<PricedOption[]> {
  const { supabase } = await requireEditor()
  return createPortfolioCourseSource(supabase).listPrices(courseId)
}

// ─── Proposal Versions (migration 012 / SPLIT 4) ────────────────────────────

export interface VersionSummary {
  id: string
  version_number: number
  label: string | null
  reason: string
  status: string | null
  created_at: string
  created_by: string | null
}

/**
 * Snapshot the current persisted plan data as an immutable version. The action
 * reads from the DB so it always reflects the last auto-saved state. Editor+.
 */
export async function saveVersionAction(planId: string, label?: string): Promise<{ version_number: number }> {
  const { supabase, user, profile } = await requireEditor()

  const { data: plan, error: planErr } = await supabase
    .from('study_plans')
    .select('data, status, org_id')
    .eq('id', planId)
    .single()
  if (planErr) throw new Error(planErr.message)
  if (!plan) throw new Error('Plan not found')

  const { data: version, error } = await supabase
    .from('proposal_versions')
    .insert({
      org_id: plan.org_id ?? profile.org_id,
      study_plan_id: planId,
      version_number: 0, // trigger sets sequential number
      label: label?.trim() || null,
      reason: 'manual',
      status: plan.status,
      data: plan.data,
      computed: toJson(fromJson<StudyPlanData>(plan.data)?.computed) ?? null,
      created_by: user.id,
    })
    .select('version_number')
    .single()
  if (error) throw new Error(error.message)
  if (!version) throw new Error('Failed to create version')

  await emitProposalEvent(supabase, {
    orgId: profile.org_id,
    studyPlanId: planId,
    actorId: user.id,
    kind: 'version_saved',
    title: label ? `Versão: ${label}` : `Versão ${version.version_number}`,
    metadata: { version_number: version.version_number, label: label ?? null },
  })

  revalidatePath('/[locale]/(protected)/study-plans/[id]', 'page')
  return { version_number: version.version_number }
}

/** Return the last 20 versions for a plan (read-only). */
export async function listVersionsAction(planId: string): Promise<VersionSummary[]> {
  const { supabase } = await requireEditor()
  const { data, error } = await supabase
    .from('proposal_versions')
    .select('id, version_number, label, reason, status, created_at, created_by')
    .eq('study_plan_id', planId)
    .order('version_number', { ascending: false })
    .limit(20)
  if (error) throw new Error(error.message)
  return (data ?? []) as VersionSummary[]
}

/**
 * Restore a specific version. Saves the current state as a `reason='restore'`
 * snapshot first, then overwrites study_plans.data with the version's data.
 * Revalidates so the editor server-renders fresh initial data. Editor+.
 */
export async function restoreVersionAction(planId: string, versionId: string): Promise<void> {
  const { supabase, user, profile } = await requireEditor()

  const { data: version, error: vErr } = await supabase
    .from('proposal_versions')
    .select('data, version_number, label')
    .eq('id', versionId)
    .eq('study_plan_id', planId)
    .single()
  if (vErr) throw new Error(vErr.message)
  if (!version) throw new Error('Version not found')

  // Snapshot current state before overwriting (best-effort).
  const { data: current } = await supabase
    .from('study_plans')
    .select('data, status, org_id')
    .eq('id', planId)
    .single()
  if (current) {
    await supabase.from('proposal_versions').insert({
      org_id: current.org_id ?? profile.org_id,
      study_plan_id: planId,
      version_number: 0,
      label: null,
      reason: 'restore',
      status: current.status,
      data: current.data,
      computed: toJson(fromJson<StudyPlanData>(current.data)?.computed) ?? null,
      created_by: user.id,
    })
  }

  const restoredData = withComputed(fromJson<StudyPlanData>(version.data))
  const { error: updateErr } = await supabase
    .from('study_plans')
    .update({ data: toJson(restoredData), updated_by: user.id })
    .eq('id', planId)
    .eq('org_id', profile.org_id)
  if (updateErr) throw new Error(updateErr.message)

  await emitProposalEvent(supabase, {
    orgId: profile.org_id,
    studyPlanId: planId,
    actorId: user.id,
    kind: 'restored',
    title: version.label ? `Restaurado: ${version.label}` : `Restaurado v${version.version_number}`,
    metadata: { restored_from_version: version.version_number, version_id: versionId },
  })

  revalidatePath('/[locale]/(protected)/study-plans/[id]', 'page')
}

// ─── Proposal Templates (migration 012 / SPLIT 4) ───────────────────────────

export interface TemplateSummary {
  id: string
  name: string
  description: string | null
  applicant_type: string | null
  created_at: string
}

/** Return all active templates for the org. */
export async function listTemplatesAction(): Promise<TemplateSummary[]> {
  const { supabase } = await requireEditor()
  const { data, error } = await supabase
    .from('proposal_templates')
    .select('id, name, description, applicant_type, created_at')
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(error.message)
  return (data ?? []) as TemplateSummary[]
}

/**
 * Save the current proposal's data as a reusable template (PII stripped — only
 * courses, extraCosts, applicantType, studentLocation preserved). Editor+.
 */
export async function saveAsTemplateAction(
  planId: string,
  name: string,
  description?: string,
): Promise<{ id: string }> {
  const { supabase, user, profile } = await requireEditor()

  const { data: plan, error: planErr } = await supabase
    .from('study_plans')
    .select('data, applicant_type')
    .eq('id', planId)
    .single()
  if (planErr) throw new Error(planErr.message)
  if (!plan) throw new Error('Plan not found')

  // Strip PII: keep only structural data (courses, extras, settings).
  const source = fromJson<StudyPlanData>(plan.data)
  const templateData: Partial<StudyPlanData> = {
    applicantType: source.applicantType,
    studentLocation: source.studentLocation,
    courses: source.courses,
    extraCosts: source.extraCosts,
    includeHolidayPlanning: source.includeHolidayPlanning,
  }

  const { data: tmpl, error } = await supabase
    .from('proposal_templates')
    .insert({
      org_id: profile.org_id,
      name: name.trim(),
      description: description?.trim() || null,
      applicant_type: plan.applicant_type || null,
      data: toJson(templateData),
      is_active: true,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  if (!tmpl) throw new Error('Failed to create template')

  await logAuditWithClient(supabase, {
    actorId: user.id,
    actorEmail: profile.email,
    action: 'proposal_template.create',
    entityType: 'proposal_templates',
    entityId: tmpl.id,
    metadata: { from_plan: planId, name },
  })

  revalidatePath('/[locale]/(protected)/study-plans', 'page')
  return { id: tmpl.id }
}

export async function getShareUrlAction(
  id: string
): Promise<{ url: string }> {
  const { supabase } = await requireEditor()

  const { data: plan } = await supabase
    .from('study_plans')
    .select('share_token')
    .eq('id', id)
    .single()

  if (!plan) throw new Error('Proposta não encontrada')
  if (!plan.share_token) throw new Error('Token de compartilhamento não gerado para esta proposta')

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_URL ??
    'http://localhost:3000'

  const base = origin.startsWith('http') ? origin : `https://${origin}`
  return { url: `${base}/pt/p/${plan.share_token}` }
}
