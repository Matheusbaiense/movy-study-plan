import { createServiceClient } from '@/lib/supabase/service'
import type { Json } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

interface AuditParams {
  actorId: string
  actorEmail: string
  action: string
  entityType?: string
  entityId?: string
  metadata?: Json
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
    })
  } catch {
    // Audit failures must not break the primary operation
  }
}

export async function logAuditWithClient(
  // Accepts a typed or untyped Supabase client (server, service, or test double).
  supabase: SupabaseClient<any, any, any>,
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
    } as never)
  } catch {
    await logAudit(params)
  }
}
