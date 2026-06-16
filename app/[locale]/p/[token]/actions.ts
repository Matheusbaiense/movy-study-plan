'use server'

import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import type { Json } from '@/types/supabase'

export interface AcceptResult {
  ok: boolean
  error?: string
}

export async function acceptProposalAction(
  token: string,
  signerName: string
): Promise<AcceptResult> {
  const name = signerName.trim()
  if (!name) return { ok: false, error: 'Nome obrigatório' }
  if (name.length < 3) return { ok: false, error: 'Nome muito curto' }

  const db = createServiceClient()

  const { data: plan, error: fetchErr } = await db
    .from('study_plans')
    .select('id, org_id, status, accepted_at, deleted_at')
    .eq('share_token', token)
    .single()

  if (fetchErr || !plan) return { ok: false, error: 'Proposta não encontrada' }
  if (plan.deleted_at) return { ok: false, error: 'Proposta não encontrada' }

  const hdrs = await headers()
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    hdrs.get('x-real-ip') ??
    'unknown'
  const userAgent = hdrs.get('user-agent') ?? 'unknown'
  const now = new Date().toISOString()

  // Atomic guard: only update if accepted_at is still null (prevents double-accept race condition)
  const { data: updated, error: updateErr } = await db
    .from('study_plans')
    .update({
      accepted_at: now,
      status: 'accepted',
      updated_at: now,
    })
    .eq('id', plan.id)
    .is('accepted_at', null)
    .select('id')
    .maybeSingle()

  if (updateErr) return { ok: false, error: 'Erro ao registrar aceitação' }
  if (!updated) return { ok: false, error: 'Proposta já foi aceita' }

  await db.from('proposal_events').insert({
    study_plan_id: plan.id,
    org_id: plan.org_id,
    kind: 'signed',
    from_me: false,
    title: 'Proposta aceita pelo aluno',
    metadata: {
      signed_by: name,
      ip,
      user_agent: userAgent,
      terms_version: '1.0',
    } as unknown as Json,
  })

  return { ok: true }
}
