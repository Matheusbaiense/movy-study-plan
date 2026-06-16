'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/api/audit'
import { isAdminOrAbove, isEditorOrAbove } from '@/lib/permissions/can'
import { getActorSession, svc } from '@/lib/actions/auth'
import type { Json } from '@/types/supabase'

const institutionSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(200),
  country: z.string().max(10).optional(),
  city: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(2000).optional(),
  partnership_status: z.string().optional(),
})

const courseSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(300),
  type: z.enum(['elicos', 'vet', 'he']),
  institution_id: z.string().uuid(),
  duration_weeks: z.number().int().min(1).optional(),
  rate_per_week_cents: z.number().int().min(0).optional(),
  currency_code: z.string().length(3).optional(),
})

type Actor = { id: string; email: string; org_id: string }

async function requireAdmin(): Promise<Actor> {
  const { profile } = await getActorSession()
  if (!isAdminOrAbove(profile.role)) throw new Error('Permissão insuficiente')
  return { id: profile.id, email: profile.email, org_id: profile.org_id }
}

async function requireEditor(): Promise<Actor> {
  const { profile } = await getActorSession()
  if (!isEditorOrAbove(profile.role)) throw new Error('Permissão insuficiente')
  return { id: profile.id, email: profile.email, org_id: profile.org_id }
}

const cents = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0
}

// ─── Institutions ─────────────────────────────────────────────────────────────

export interface InstitutionInput {
  name: string
  country?: string
  city?: string
  website?: string
  notes?: string
  partnership_status?: string
}

export async function createInstitutionAction(input: InstitutionInput): Promise<{ id: string }> {
  institutionSchema.parse(input)
  const actor = await requireAdmin()
  const db = svc()
  if (!db) throw new Error('Serviço não configurado')

  const name = input.name?.trim()
  if (!name) throw new Error('Nome obrigatório')

  const { data, error } = await db
    .from('institutions')
    .insert({
      org_id: actor.org_id,
      name,
      country: input.country?.trim() || 'AU',
      city: input.city?.trim() || null,
      website: input.website?.trim() || null,
      notes: input.notes?.trim() || null,
      partnership_status: input.partnership_status || 'active',
      created_by: actor.id,
      updated_by: actor.id,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  await logAudit({ actorId: actor.id, actorEmail: actor.email, action: 'institution.created', entityType: 'institution', entityId: data.id, metadata: { name } as unknown as Json })
  revalidatePath('/[locale]/(protected)/portfolio', 'page')
  return { id: data.id }
}

export async function updateInstitutionAction(id: string, input: InstitutionInput): Promise<void> {
  const actor = await requireAdmin()
  const db = svc()
  if (!db) throw new Error('Serviço não configurado')

  const name = input.name?.trim()
  if (!name) throw new Error('Nome obrigatório')

  const { error } = await db
    .from('institutions')
    .update({
      name,
      country: input.country?.trim() || 'AU',
      city: input.city?.trim() || null,
      website: input.website?.trim() || null,
      notes: input.notes?.trim() || null,
      partnership_status: input.partnership_status || 'active',
      updated_by: actor.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('org_id', actor.org_id)

  if (error) throw new Error(error.message)
  await logAudit({ actorId: actor.id, actorEmail: actor.email, action: 'institution.updated', entityType: 'institution', entityId: id, metadata: { name } as unknown as Json })
  revalidatePath('/[locale]/(protected)/portfolio', 'page')
  revalidatePath(`/[locale]/(protected)/portfolio/${id}`, 'page')
}

export async function archiveInstitutionAction(id: string): Promise<void> {
  const actor = await requireAdmin()
  const db = svc()
  if (!db) throw new Error('Serviço não configurado')

  const { error } = await db
    .from('institutions')
    .update({ deleted_at: new Date().toISOString(), updated_by: actor.id })
    .eq('id', id)
    .eq('org_id', actor.org_id)

  if (error) throw new Error(error.message)
  await logAudit({ actorId: actor.id, actorEmail: actor.email, action: 'institution.archived', entityType: 'institution', entityId: id })
  revalidatePath('/[locale]/(protected)/portfolio', 'page')
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export interface CourseInput {
  institution_id: string
  name: string
  type: string
  cricos?: string
  english_level?: string
  timetable?: string
  default_intake?: string
}

export async function createCourseAction(input: CourseInput): Promise<{ id: string }> {
  z.object({ institution_id: z.string().uuid(), name: z.string().min(1).max(300), type: z.string().min(1) }).parse(input)
  const actor = await requireAdmin()
  const db = svc()
  if (!db) throw new Error('Serviço não configurado')

  const name = input.name?.trim()
  if (!name) throw new Error('Nome obrigatório')
  if (!input.institution_id) throw new Error('Instituição obrigatória')

  const { data, error } = await db
    .from('courses')
    .insert({
      org_id: actor.org_id,
      institution_id: input.institution_id,
      name,
      type: input.type || 'elicos',
      cricos: input.cricos?.trim() || null,
      english_level: input.english_level?.trim() || null,
      timetable: input.timetable?.trim() || 'Integral',
      default_intake: input.default_intake?.trim() || null,
      source: 'manual',
      is_active: true,
      created_by: actor.id,
      updated_by: actor.id,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  await logAudit({ actorId: actor.id, actorEmail: actor.email, action: 'course.created', entityType: 'course', entityId: data.id, metadata: { name } as unknown as Json })
  revalidatePath(`/[locale]/(protected)/portfolio/${input.institution_id}`, 'page')
  return { id: data.id }
}

export async function updateCourseAction(id: string, institutionId: string, input: Omit<CourseInput, 'institution_id'>): Promise<void> {
  const actor = await requireAdmin()
  const db = svc()
  if (!db) throw new Error('Serviço não configurado')

  const name = input.name?.trim()
  if (!name) throw new Error('Nome obrigatório')

  const { error } = await db
    .from('courses')
    .update({
      name,
      type: input.type || 'elicos',
      cricos: input.cricos?.trim() || null,
      english_level: input.english_level?.trim() || null,
      timetable: input.timetable?.trim() || 'Integral',
      default_intake: input.default_intake?.trim() || null,
      updated_by: actor.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('org_id', actor.org_id)

  if (error) throw new Error(error.message)
  await logAudit({ actorId: actor.id, actorEmail: actor.email, action: 'course.updated', entityType: 'course', entityId: id, metadata: { name } as unknown as Json })
  revalidatePath(`/[locale]/(protected)/portfolio/${institutionId}`, 'page')
}

export async function toggleCourseActiveAction(id: string, institutionId: string, isActive: boolean): Promise<void> {
  const actor = await requireEditor()
  const db = svc()
  if (!db) throw new Error('Serviço não configurado')

  const { error } = await db
    .from('courses')
    .update({ is_active: isActive, updated_by: actor.id, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('org_id', actor.org_id)

  if (error) throw new Error(error.message)
  revalidatePath(`/[locale]/(protected)/portfolio/${institutionId}`, 'page')
}

export async function archiveCourseAction(id: string, institutionId: string): Promise<void> {
  const actor = await requireAdmin()
  const db = svc()
  if (!db) throw new Error('Serviço não configurado')

  const { error } = await db
    .from('courses')
    .update({ deleted_at: new Date().toISOString(), updated_by: actor.id })
    .eq('id', id)
    .eq('org_id', actor.org_id)

  if (error) throw new Error(error.message)
  await logAudit({ actorId: actor.id, actorEmail: actor.email, action: 'course.archived', entityType: 'course', entityId: id })
  revalidatePath(`/[locale]/(protected)/portfolio/${institutionId}`, 'page')
}

// ─── Price Versions ───────────────────────────────────────────────────────────

export interface PriceVersionInput {
  course_id: string
  institution_id: string
  valid_from: string
  valid_until?: string
  enrolment_fee_in_cents: number
  rate_per_week_in_cents: number
  material_fee_in_cents?: number
  deposit_weeks?: number
  payment_parts?: number
  currency_code?: string
}

export async function createPriceVersionAction(input: PriceVersionInput): Promise<{ id: string }> {
  const actor = await requireAdmin()
  const db = svc()
  if (!db) throw new Error('Serviço não configurado')

  if (!input.course_id) throw new Error('Curso obrigatório')
  if (!input.valid_from) throw new Error('Data de início obrigatória')

  const { data, error } = await db
    .from('course_price_versions')
    .insert({
      org_id: actor.org_id,
      course_id: input.course_id,
      valid_from: input.valid_from,
      valid_until: input.valid_until || null,
      enrolment_fee_in_cents: cents(input.enrolment_fee_in_cents),
      rate_per_week_in_cents: cents(input.rate_per_week_in_cents),
      material_fee_in_cents: cents(input.material_fee_in_cents ?? 0),
      deposit_weeks: Number(input.deposit_weeks) || 0,
      payment_parts: Number(input.payment_parts) || 1,
      currency_code: input.currency_code || 'AUD',
      has_material: (input.material_fee_in_cents ?? 0) > 0,
      created_by: actor.id,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  await logAudit({ actorId: actor.id, actorEmail: actor.email, action: 'price_version.created', entityType: 'course_price_version', entityId: data.id, metadata: { course_id: input.course_id } as unknown as Json })
  revalidatePath(`/[locale]/(protected)/portfolio/${input.institution_id}`, 'page')
  return { id: data.id }
}

// ─── Pricing Rules ────────────────────────────────────────────────────────────

export interface PricingRuleInput {
  label?: string
  scope: string
  scope_id?: string
  conditions?: Record<string, unknown>
  effect: Record<string, unknown>
  priority?: number
  valid_from?: string
  valid_until?: string
}

export async function createPricingRuleAction(input: PricingRuleInput): Promise<{ id: string }> {
  const actor = await requireAdmin()
  const db = svc()
  if (!db) throw new Error('Serviço não configurado')

  if (!input.scope) throw new Error('Escopo obrigatório')
  if (!input.effect) throw new Error('Efeito obrigatório')

  const { data, error } = await db
    .from('pricing_rules')
    .insert({
      org_id: actor.org_id,
      label: input.label?.trim() || null,
      scope: input.scope,
      scope_id: input.scope_id || null,
      conditions: (input.conditions ?? {}) as unknown as Json,
      effect: input.effect as unknown as Json,
      priority: Number(input.priority) || 0,
      valid_from: input.valid_from || null,
      valid_until: input.valid_until || null,
      is_active: true,
      created_by: actor.id,
      updated_by: actor.id,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  await logAudit({ actorId: actor.id, actorEmail: actor.email, action: 'pricing_rule.created', entityType: 'pricing_rule', entityId: data.id, metadata: { scope: input.scope } as unknown as Json })
  revalidatePath('/[locale]/(protected)/portfolio', 'page')
  return { id: data.id }
}

export async function togglePricingRuleAction(id: string, isActive: boolean): Promise<void> {
  const actor = await requireAdmin()
  const db = svc()
  if (!db) throw new Error('Serviço não configurado')

  const { error } = await db
    .from('pricing_rules')
    .update({ is_active: isActive, updated_by: actor.id, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('org_id', actor.org_id)

  if (error) throw new Error(error.message)
  revalidatePath('/[locale]/(protected)/portfolio', 'page')
}

export async function deletePricingRuleAction(id: string): Promise<void> {
  const actor = await requireAdmin()
  const db = svc()
  if (!db) throw new Error('Serviço não configurado')

  const { error } = await db
    .from('pricing_rules')
    .update({ deleted_at: new Date().toISOString(), updated_by: actor.id })
    .eq('id', id)
    .eq('org_id', actor.org_id)

  if (error) throw new Error(error.message)
  await logAudit({ actorId: actor.id, actorEmail: actor.email, action: 'pricing_rule.deleted', entityType: 'pricing_rule', entityId: id })
  revalidatePath('/[locale]/(protected)/portfolio', 'page')
}
