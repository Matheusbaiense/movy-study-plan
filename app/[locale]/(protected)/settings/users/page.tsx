import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { isSuperAdmin } from '@/lib/permissions/can'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function UsersPage({ params }: Props) {
  const { locale } = await params
  const { profile } = await getUser(locale)
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('id, full_name, email, role, department, is_active, created_at')
    .order('created_at', { ascending: false })

  if (!isSuperAdmin(profile.role)) {
    query = query.neq('role', 'super_admin')
  }

  const { data: users } = await query

  const ROLE_COLORS: Record<string, string> = {
    super_admin: '#D23B2B',
    admin: '#F36B1C',
    editor: '#4B1A77',
    reader: '#2A1153',
  }

  return (
    <div>
      <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(28,18,51,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Nome', 'Email', 'Role', 'Dept', 'Status'].map(h => (
                <th key={h} style={{
                  background: '#2A1153', color: '#F9F9F9',
                  padding: '10px 14px', textAlign: 'left',
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u, i) => (
              <tr key={u.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(28,18,51,0.02)' }}>
                <td style={{ padding: '10px 14px', color: '#2A1153', fontWeight: 500 }}>
                  {u.full_name ?? '—'}
                </td>
                <td style={{ padding: '10px 14px', color: 'rgba(28,18,51,0.6)' }}>
                  {u.email}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: ROLE_COLORS[u.role] ?? '#2A1153',
                    background: `${ROLE_COLORS[u.role] ?? '#2A1153'}15`,
                    padding: '2px 8px', borderRadius: 6, textTransform: 'capitalize',
                  }}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', color: 'rgba(28,18,51,0.6)' }}>
                  {u.department ?? '—'}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: u.is_active ? '#4B1A77' : '#D23B2B' }}>
                    {u.is_active ? '● Ativo' : '○ Inativo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
