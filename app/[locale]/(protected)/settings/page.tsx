import { getUser } from '@/lib/auth/get-user'
import { createClient } from '@/lib/supabase/server'
import { color, ink, font, roleColor } from '@/lib/ui/theme'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params
  const { profile } = await getUser(locale)
  const supabase = await createClient()

  const [{ count: usersCount }, { count: contentCount }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('contents').select('*', { count: 'exact', head: true }).eq('status', 'published'),
  ])

  const accent = roleColor[profile.role] ?? color.purpleDeep
  const isPt = locale === 'pt'

  return (
    <div className="movy-stagger" style={{ maxWidth: 640, display: 'grid', gap: 18 }}>
      {/* Profile card */}
      <div className="movy-card" style={{ padding: '20px 22px' }}>
        <div className="movy-kicker" style={{ color: ink(0.4), marginBottom: 14 }}>
          {isPt ? 'Meu perfil' : 'My profile'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: '50%', background: accent, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700,
            fontFamily: font.display,
          }}>
            {(profile.full_name ?? profile.email).slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 800, color: color.purpleDeep }}>
              {profile.full_name ?? profile.email}
            </div>
            <div style={{ fontSize: 13, color: ink(0.5) }}>
              {profile.email} · <span style={{ textTransform: 'capitalize', color: accent, fontWeight: 700 }}>{profile.role.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* System stats */}
      <div className="movy-card" style={{ padding: '20px 22px' }}>
        <div className="movy-kicker" style={{ color: ink(0.4), marginBottom: 16 }}>
          {isPt ? 'Sistema' : 'System'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Stat value={usersCount ?? 0} label={isPt ? 'usuários ativos' : 'active users'} />
          <Stat value={contentCount ?? 0} label={isPt ? 'documentos publicados' : 'published documents'} />
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: font.display, fontSize: 30, fontWeight: 800, color: color.purpleDeep, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: ink(0.5) }}>{label}</div>
    </div>
  )
}
