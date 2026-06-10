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
    super_admin: '#E72C03',
    admin: '#FF8B00',
    editor: '#057570',
    reader: '#03182D',
  }

  return (
    <div>
      <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(3,24,45,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Nome', 'Email', 'Role', 'Dept', 'Status'].map(h => (
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
            {(users ?? []).map((u, i) => (
              <tr key={u.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(3,24,45,0.02)' }}>
                <td style={{ padding: '10px 14px', color: '#03182D', fontWeight: 500 }}>
                  {u.full_name ?? '—'}
                </td>
                <td style={{ padding: '10px 14px', color: 'rgba(3,24,45,0.6)' }}>
                  {u.email}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: ROLE_COLORS[u.role] ?? '#03182D',
                    background: `${ROLE_COLORS[u.role] ?? '#03182D'}15`,
                    padding: '2px 8px', borderRadius: 6, textTransform: 'capitalize',
                  }}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', color: 'rgba(3,24,45,0.6)' }}>
                  {u.department ?? '—'}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: u.is_active ? '#057570' : '#E72C03' }}>
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
