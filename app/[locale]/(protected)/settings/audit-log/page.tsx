import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'

interface Props {
  params: Promise<{ locale: string }>
}

const ACTION_LABELS: Record<string, string> = {
  content_created: 'Criou conteúdo',
  content_updated: 'Editou conteúdo',
  content_deleted: 'Deletou conteúdo',
  user_role_changed: 'Alterou role',
  user_deactivated: 'Desativou usuário',
  login: 'Login',
  'content.create': 'Criou conteúdo',
  'content.update': 'Atualizou conteúdo',
  'content.publish': 'Publicou conteúdo',
  'content.delete': 'Deletou conteúdo',
  'user.activate': 'Ativou usuário',
  'user.role_change': 'Mudou papel',
  'domain.add': 'Adicionou domínio',
}

export default async function AuditLogPage({ params }: Props) {
  const { locale } = await params
  await getUser(locale)
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(3,24,45,0.08)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['Ação', 'Ator', 'Alvo', 'Data (Perth)'].map(h => (
              <th key={h} style={{
                background: '#03182D', color: '#F9F9F9',
                padding: '10px 14px', textAlign: 'left',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(logs ?? []).map((log, i) => (
            <tr key={log.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(3,24,45,0.02)' }}>
              <td style={{ padding: '10px 14px' }}>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  background: 'rgba(3,24,45,0.07)', color: '#03182D',
                  padding: '2px 8px', borderRadius: 6,
                }}>
                  {ACTION_LABELS[log.action] ?? log.action}
                </span>
              </td>
              <td style={{ padding: '10px 14px', color: 'rgba(3,24,45,0.6)', fontFamily: 'monospace', fontSize: 11 }}>
                {log.actor_email ?? log.actor_id?.slice(0, 8) ?? '—'}
              </td>
              <td style={{ padding: '10px 14px', color: 'rgba(3,24,45,0.6)', fontFamily: 'monospace', fontSize: 11 }}>
                {log.entity_type ? `${log.entity_type}/${(log.entity_id ?? '').slice(0, 8)}` : '—'}
              </td>
              <td style={{ padding: '10px 14px', color: 'rgba(3,24,45,0.6)', fontSize: 12 }}>
                {log.created_at
                  ? new Date(log.created_at).toLocaleString('en-AU', {
                      timeZone: 'Australia/Perth',
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
