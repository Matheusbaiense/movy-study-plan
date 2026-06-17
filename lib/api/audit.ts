import * as Sentry from '@sentry/nextjs'
import { createServiceClient } from '@/lib/supabase/service'
import type { Json, Database, TablesInsert } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Audit logging. Two entry points, ONE rule for which to use:
 *
 *   - `logAuditWithClient(supabase, params)` — PREFER THIS whenever you already
 *     hold the actor's user client (from `requireActor`/`requireEditor`/
 *     `requireAdmin`). The insert is RLS-attributed to the actor, and any
 *     failure falls back to the service-role write. Used by user-client mutators
 *     (study-plans, wiki, hr).
 *   - `logAudit(params)` — for pure service-role contexts that have NO user
 *     client in scope (portfolio/presets/users mutate via `svc()`).
 *
 * Both are best-effort: a logging failure must never break the primary mutation.
 */

interface AuditParams {
  actorId: string
  actorEmail: string
  action: string
  entityType?: string
  entityId?: string
  metadata?: Json
  orgId?: string
}

function auditRow(params: AuditParams): TablesInsert<'audit_logs'> {
  return {
    actor_id: params.actorId,
    actor_email: params.actorEmail,
    action: params.action,
    entity_type: params.entityType ?? null,
    entity_id: params.entityId ?? null,
    metadata: params.metadata ?? null,
    org_id: params.orgId,
  }
}

export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await createServiceClient().from('audit_logs').insert(auditRow(params))
  } catch (err) {
    Sentry.captureException(err, { extra: { action: params.action } })
  }
}

export async function logAuditWithClient(
  supabase: SupabaseClient<Database>,
  params: AuditParams
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert(auditRow(params))
  } catch {
    await logAudit(params)
  }
}
