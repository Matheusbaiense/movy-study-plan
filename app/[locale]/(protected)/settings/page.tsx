import { getUser } from '@/lib/auth/get-user'
import { createClient } from '@/lib/supabase/server'

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

  const LANGS = [
    { code: 'pt', label: 'Português' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
  ]

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Profile card */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid rgba(28,18,51,0.07)', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(28,18,51,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
          {locale === 'pt' ? 'Meu perfil' : 'My profile'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: '#2A1153', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700,
          }}>
            {(profile.full_name ?? profile.email).slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#2A1153' }}>{profile.full_name ?? profile.email}</div>
            <div style={{ fontSize: 13, color: 'rgba(28,18,51,0.5)' }}>
              {profile.email} · <span style={{ textTransform: 'capitalize' }}>{profile.role.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* System stats */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid rgba(28,18,51,0.07)', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(28,18,51,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
          {locale === 'pt' ? 'Sistema' : 'System'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2A1153' }}>{usersCount ?? 0}</div>
            <div style={{ fontSize: 12, color: 'rgba(28,18,51,0.5)' }}>{locale === 'pt' ? 'usuários ativos' : 'active users'}</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2A1153' }}>{contentCount ?? 0}</div>
            <div style={{ fontSize: 12, color: 'rgba(28,18,51,0.5)' }}>{locale === 'pt' ? 'documentos publicados' : 'published documents'}</div>
          </div>
        </div>
      </div>

      {/* Language */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid rgba(28,18,51,0.07)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(28,18,51,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
          {locale === 'pt' ? 'Idioma' : 'Language'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {LANGS.map(lang => (
            <a
              key={lang.code}
              href={`/${lang.code}/settings`}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
                background: locale === lang.code ? '#2A1153' : 'rgba(28,18,51,0.06)',
                color: locale === lang.code ? '#fff' : '#2A1153',
              }}
            >
              {lang.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
