'use server'

import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/api/audit'
import { requireAdmin, svc as serviceClient } from '@/lib/actions/auth'
import type { TablesInsert, TablesUpdate } from '@/types/supabase'

export interface PresetResult {
  ok: boolean
  error?: string
}

const TYPES = ['elicos', 'vet', 'he']
const SERVICE_MISSING =
  'Configuração ausente no servidor: defina SUPABASE_SERVICE_ROLE_KEY (Vercel → Settings → Environment Variables).'

const num = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export interface PresetInput {
  type: string
  provider: string
  name: string
  rate_per_week: number
  tuition: number
  enrolment_fee: number
  material_fee: number
  has_material: boolean
  scholarship: number
  timetable: string
  payment_parts: number
  payment_frequency: string
  deposit_weeks: number
}

function sanitize(input: Partial<PresetInput>) {
  const row: Record<string, unknown> = {}
  if (input.type !== undefined) {
    if (!TYPES.includes(input.type)) return null
    row.type = input.type
  }
  if (input.provider !== undefined) row.provider = String(input.provider).trim()
  if (input.name !== undefined) row.name = String(input.name).trim()
  if (input.timetable !== undefined) row.timetable = String(input.timetable).trim()
  if (input.payment_frequency !== undefined) row.payment_frequency = String(input.payment_frequency).trim()
  if (input.has_material !== undefined) row.has_material = Boolean(input.has_material)
  for (const k of ['rate_per_week', 'tuition', 'enrolment_fee', 'material_fee', 'scholarship', 'payment_parts', 'deposit_weeks'] as const) {
    if (input[k] !== undefined) row[k] = num(input[k])
  }
  return row
}

export async function createPreset(input: PresetInput): Promise<PresetResult> {
  const { profile: actor } = await requireAdmin()
  if (!input.provider?.trim() || !input.name?.trim()) return { ok: false, error: 'Escola e curso são obrigatórios.' }
  const row = sanitize(input)
  if (!row || !row.type) return { ok: false, error: 'Tipo de curso inválido.' }

  const svc = serviceClient()
  if (!svc) return { ok: false, error: SERVICE_MISSING }

  const { error } = await svc
    .from('course_presets')
    .insert({ ...row, org_id: actor.org_id } as unknown as TablesInsert<'course_presets'>)
  if (error) return { ok: false, error: error.message }

  await logAudit({ actorId: actor.id, actorEmail: actor.email, action: 'preset.create', entityType: 'course_presets', metadata: { provider: String(row.provider ?? ''), name: String(row.name ?? '') } })
  revalidatePath('/[locale]/(protected)/settings/presets', 'page')
  return { ok: true }
}

export async function updatePreset(id: string, patch: Partial<PresetInput>): Promise<PresetResult> {
  const { profile: actor } = await requireAdmin()
  const row = sanitize(patch)
  if (!row) return { ok: false, error: 'Dados inválidos.' }
  if (Object.keys(row).length === 0) return { ok: true }

  const svc = serviceClient()
  if (!svc) return { ok: false, error: SERVICE_MISSING }

  const { error } = await svc
    .from('course_presets')
    .update(row as unknown as TablesUpdate<'course_presets'>)
    .eq('id', id)
    .eq('org_id', actor.org_id)
  if (error) return { ok: false, error: error.message }

  await logAudit({ actorId: actor.id, actorEmail: actor.email, action: 'preset.update', entityType: 'course_presets', entityId: id, metadata: row as Record<string, string | number | boolean> })
  revalidatePath('/[locale]/(protected)/settings/presets', 'page')
  return { ok: true }
}

export async function deletePreset(id: string): Promise<PresetResult> {
  const { profile: actor } = await requireAdmin()
  const svc = serviceClient()
  if (!svc) return { ok: false, error: SERVICE_MISSING }

  const { error } = await svc.from('course_presets').delete().eq('id', id).eq('org_id', actor.org_id)
  if (error) return { ok: false, error: error.message }

  await logAudit({ actorId: actor.id, actorEmail: actor.email, action: 'preset.delete', entityType: 'course_presets', entityId: id })
  revalidatePath('/[locale]/(protected)/settings/presets', 'page')
  return { ok: true }
}
