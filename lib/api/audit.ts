import * as Sentry from '@sentry/nextjs'
import { createServiceClient } from '@/lib/supabase/service'
import type { Json, Database } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

interface AuditParams {
  actorId: string
  actorEmail: string
  action: string
  entityType?: string
  entityId?: string
  metadata?: Json
  orgId?: string
}

export async function logAudit(params: AuditParams): Promise<void> {
  try {
    const supabase = createServiceClient()
    await supabase.from('audit_logs').insert({
      actor_id: params.actorId,
      actor_email: params.actorEmail,
      action: params.action,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? null,
      org_id: params.orgId ?? null,
    })
  } catch (err) {
    Sentry.captureException(err, { extra: { action: params.action } })
  }
}

export async function logAuditWithClient(
  supabase: SupabaseClient<Database>,
  params: AuditParams
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      actor_id: params.actorId,
      actor_email: params.actorEmail,
      action: params.action,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? null,
      org_id: params.orgId ?? null,
    })
  } catch {
    await logAudit(params)
  }
}
