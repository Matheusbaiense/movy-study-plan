'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logAudit } from '@/lib/api/audit'
import { isAdminOrAbove } from '@/lib/permissions/can'

export interface PresetResult {
  ok: boolean
  error?: string
}

interface Actor {
  id: string
  email: string
}

const TYPES = ['elicos', 'vet', 'he']
const SERVICE_MISSING =
  'Configuração ausente no servidor: defina SUPABASE_SERVICE_ROLE_KEY (Vercel → Settings → Environment Variables).'

async function requireAdmin(): Promise<Actor> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/unauthorized')

  const { data: profile } = await supabase.from('profiles').select('id, email, role').eq('id', user.id).single()
  if (!profile || !isAdminOrAbove(profile.role)) throw new Error('Insufficient permissions')
  return { id: profile.id, email: profile.email }
}

function serviceClient() {
  try {
    return createServiceClient()
  } catch {
    return null
  }
}

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
  const actor = await requireAdmin()
  if (!input.provider?.trim() || !input.name?.trim()) return { ok: false, error: 'Escola e curso são obrigatórios.' }
  const row = sanitize(input)
  if (!row || !row.type) return { ok: false, error: 'Tipo de curso inválido.' }

  const svc = serviceClient()
  if (!svc) return { ok: false, error: SERVICE_MISSING }

  const { error } = await (svc as any).from('course_presets').insert(row)
  if (error) return { ok: false, error: error.message }

  await logAudit({ actorId: actor.id, actorEmail: actor.email, action: 'preset.create', entityType: 'course_presets', metadata: { provider: String(row.provider ?? ''), name: String(row.name ?? '') } })
  revalidatePath('/[locale]/(protected)/settings/presets', 'page')
  return { ok: true }
}

export async function updatePreset(id: string, patch: Partial<PresetInput>): Promise<PresetResult> {
  const actor = await requireAdmin()
  const row = sanitize(patch)
  if (!row) return { ok: false, error: 'Dados inválidos.' }
  if (Object.keys(row).length === 0) return { ok: true }

  const svc = serviceClient()
  if (!svc) return { ok: false, error: SERVICE_MISSING }

  const { error } = await (svc as any).from('course_presets').update(row).eq('id', id)
  if (error) return { ok: false, error: error.message }

  await logAudit({ actorId: actor.id, actorEmail: actor.email, action: 'preset.update', entityType: 'course_presets', entityId: id, metadata: row as Record<string, string | number | boolean> })
  revalidatePath('/[locale]/(protected)/settings/presets', 'page')
  return { ok: true }
}

export async function deletePreset(id: string): Promise<PresetResult> {
  const actor = await requireAdmin()
  const svc = serviceClient()
  if (!svc) return { ok: false, error: SERVICE_MISSING }

  const { error } = await (svc as any).from('course_presets').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  await logAudit({ actorId: actor.id, actorEmail: actor.email, action: 'preset.delete', entityType: 'course_presets', entityId: id })
  revalidatePath('/[locale]/(protected)/settings/presets', 'page')
  return { ok: true }
}
