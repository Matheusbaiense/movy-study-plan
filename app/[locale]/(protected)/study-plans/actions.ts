'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAuditWithClient } from '@/lib/api/audit'
import { isEditorOrAbove, isAdminOrAbove } from '@/lib/permissions/can'
import { createBlankStudyPlan } from '@/lib/study-plans/defaults'
import { computeProposal } from '@/lib/study-plans/calculations'
import { upsertContact as upsertContactRecord } from '@/lib/crm/contacts'
import type { StudyPlanData, StudyPlanStatus } from '@/lib/study-plans/types'
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

async function getActor() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email, org_id')
    .eq('id', user.id)
    .single()

  if (!profile || !isEditorOrAbove(profile.role)) {
    throw new Error('Insufficient permissions')
  }

  return { supabase, user, profile }
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
  const { supabase, user, profile } = await getActor()
  const data = withComputed(createBlankStudyPlan())

  const { data: plan, error } = await supabase
    .from('study_plans')
    .insert({
      title: 'Nova cotação',
      student_name: data.student,
      applicant_type: data.applicantType,
      status: 'draft',
      data: data as unknown as Json,
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
  const { supabase, user, profile } = await getActor()
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
      data: persisted as unknown as Json,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

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
  const { supabase, user, profile } = await getActor()

  const { data: source, error: srcErr } = await supabase
    .from('study_plans')
    .select('title, student_name, applicant_type, data, contact_id, currency_code')
    .eq('id', id)
    .single()

  if (srcErr) throw new Error(srcErr.message)
  if (!source) throw new Error('Study plan not found')

  const persisted = withComputed(source.data as unknown as StudyPlanData)

  const { data: plan, error } = await supabase
    .from('study_plans')
    .insert({
      title: `${source.title} (cópia)`,
      student_name: source.student_name,
      applicant_type: source.applicant_type,
      status: 'draft',
      data: persisted as unknown as Json,
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
  const { supabase, user, profile } = await getActor()
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

  const { error } = await supabase.from('study_plans').update(patch).eq('id', id)
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
  const { supabase, user, profile } = await getActor()

  const { error } = await supabase
    .from('study_plans')
    .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)

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
  const { supabase, user, profile } = await getActor()

  const { error } = await supabase
    .from('study_plans')
    .update({ deleted_at: null, updated_by: user.id })
    .eq('id', id)

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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email, org_id')
    .eq('id', user.id)
    .single()

  if (!profile || !isAdminOrAbove(profile.role)) {
    throw new Error('Insufficient permissions')
  }

  const { error } = await supabase.from('study_plans').delete().eq('id', id)
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
    const { supabase, user, profile } = await getActor()
    const stamp = new Date().toISOString()

    for (const id of unique) {
      const patch =
        op === 'archive'
          ? { status: 'archived' as Enums<'study_plan_status'>, updated_by: user.id, updated_at: stamp }
          : op === 'soft_delete'
            ? { deleted_at: stamp, updated_by: user.id }
            : { deleted_at: null, updated_by: user.id }

      const { error } = await supabase.from('study_plans').update(patch).eq('id', id)
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
  const { supabase, user, profile } = await getActor()

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

export async function deleteStudyPlan(id: string, locale = 'pt') {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single()

  if (!profile || !isAdminOrAbove(profile.role)) {
    throw new Error('Insufficient permissions')
  }

  const { error } = await supabase.from('study_plans').delete().eq('id', id)
  if (error) throw new Error(error.message)

  await logAuditWithClient(supabase, {
    actorId: user.id,
    actorEmail: profile.email,
    action: 'study_plan.delete',
    entityType: 'study_plans',
    entityId: id,
  })

  revalidatePath(`/${locale}/study-plans`)
  redirect(`/${locale}/study-plans`)
}
