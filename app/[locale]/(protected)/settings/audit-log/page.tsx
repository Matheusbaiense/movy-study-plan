import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { color, ink, font, purpleA } from '@/lib/ui/theme'

interface Props {
  params: Promise<{ locale: string }>
}

const ACTION_LABELS: Record<string, string> = {
  content_created: 'Criou conteúdo',
  content_updated: 'Editou conteúdo',
  content_deleted: 'Deletou conteúdo',
  user_role_changed: 'Alterou papel',
  user_deactivated: 'Desativou usuário',
  login: 'Login',
  'content.create': 'Criou conteúdo',
  'content.update': 'Atualizou conteúdo',
  'content.publish': 'Publicou conteúdo',
  'content.delete': 'Deletou conteúdo',
  'user.create': 'Criou usuário',
  'user.activate': 'Ativou usuário',
  'user.deactivate': 'Desativou usuário',
  'user.role_change': 'Mudou papel',
  'user.delete': 'Excluiu usuário',
  'allowed_email.add': 'Autorizou email',
  'allowed_email.remove': 'Removeu email',
  'study_plan.create': 'Criou cotação',
  'study_plan.update': 'Atualizou cotação',
  'study_plan.delete': 'Excluiu cotação',
  'domain.add': 'Adicionou domínio',
}

async function fetchAuditLogs() {
  const supabase = await createClient()
  return supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
}

export default async function AuditLogPage({ params }: Props) {
  const { locale } = await params

  // RLS scopes the logs to the actor's org, so the fetch can run in parallel
  // with the auth/profile validation instead of waiting for it.
  const [, logsResult] = await Promise.all([getUser(locale), fetchAuditLogs()])

  const rows = logsResult.data ?? []

  return (
    <div className="movy-card" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Ação', 'Ator', 'Alvo', 'Data (Perth)'].map((h) => (
                <th key={h} className="movy-kicker" style={{ padding: '13px 16px', textAlign: 'left', fontSize: 10, borderBottom: `1px solid ${color.line}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '48px 24px', textAlign: 'center', color: ink(0.5), fontSize: 13.5 }}>
                  Nenhum registro de auditoria ainda.
                </td>
              </tr>
            ) : (
              rows.map((log) => (
                <tr key={log.id} style={{ borderBottom: `1px solid ${ink(0.05)}` }}>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontFamily: font.ui, fontSize: 12, fontWeight: 700, background: purpleA(0.08), color: color.purple, padding: '3px 10px', borderRadius: 999 }}>
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: ink(0.62), fontFamily: font.mono, fontSize: 11 }}>
                    {log.actor_email ?? log.actor_id?.slice(0, 8) ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: ink(0.55), fontFamily: font.mono, fontSize: 11 }}>
                    {log.entity_type ? `${log.entity_type}/${(log.entity_id ?? '').slice(0, 8)}` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: ink(0.55), fontFamily: font.mono, fontSize: 11 }}>
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString('en-AU', { timeZone: 'Australia/Perth', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
