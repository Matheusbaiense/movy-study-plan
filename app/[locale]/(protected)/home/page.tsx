import Link from 'next/link'
import { getUser } from '@/lib/auth/get-user'
import { createClient } from '@/lib/supabase/server'
import { isEditorOrAbove } from '@/lib/permissions/can'
import { DEPARTMENTS, getDeptName, getDeptDesc } from '@/lib/constants/departments'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const { profile } = await getUser(locale)
  const supabase = await createClient()

  const perthHour = parseInt(
    new Date().toLocaleString('en-AU', { timeZone: 'Australia/Perth', hour: 'numeric', hour12: false }),
    10
  )
  const greetKey = perthHour < 12 ? 'morning' : perthHour < 18 ? 'afternoon' : 'evening'
  const GREET = {
    morning:   { pt: 'Bom dia',   es: 'Buenos días',   en: 'Good morning' },
    afternoon: { pt: 'Boa tarde', es: 'Buenas tardes', en: 'Good afternoon' },
    evening:   { pt: 'Boa noite', es: 'Buenas noches', en: 'Good evening' },
  } as const
  const greet = GREET[greetKey][(locale as 'pt' | 'es' | 'en') ?? 'en'] ?? GREET[greetKey].en
  const firstName = (profile.full_name ?? profile.email).split(' ')[0]
  const canWrite = isEditorOrAbove(profile.role)

  const { data: recent } = await supabase
    .from('contents')
    .select('id, slug, title_pt, title_en, title_es, summary, department_id, updated_at, content_type')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(5)

  const deptLabel = (id: string | null) => {
    const d = DEPARTMENTS.find(dep => dep.slug === id)
    return d ? getDeptName(d, locale) : id ?? '—'
  }

  const titleFor = (item: NonNullable<typeof recent>[number]) =>
    locale === 'en' ? (item.title_en || item.title_pt)
    : locale === 'es' ? (item.title_es || item.title_pt)
    : item.title_pt

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Greeting */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: 'rgba(28,18,51,0.5)', marginBottom: 6 }}>
          {greet}, {firstName} ·{' '}
          {new Date().toLocaleDateString(
            locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-AU',
            { weekday: 'long', day: '2-digit', month: 'long', timeZone: 'Australia/Perth' }
          )}
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#2A1153', margin: 0, letterSpacing: '-0.02em' }}>
          {locale === 'pt' ? 'O que você precisa hoje?' : locale === 'es' ? '¿Qué necesitas hoy?' : 'What do you need today?'}
        </h1>
      </div>

      {/* Search bar */}
      <form action={`/${locale}/search`} method="GET" style={{ marginBottom: 36 }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,18,51,0.4)' }} width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input
            name="q"
            placeholder={locale === 'pt' ? 'Buscar processos, templates, políticas...' : locale === 'es' ? 'Buscar procesos, plantillas, políticas...' : 'Search processes, templates, policies...'}
            style={{
              width: '100%', padding: '14px 16px 14px 46px',
              borderRadius: 14, border: '1.5px solid rgba(28,18,51,0.12)',
              fontSize: 15, fontFamily: 'Outfit, sans-serif',
              background: '#fff', color: '#2A1153', outline: 'none',
              boxShadow: '0 2px 8px rgba(28,18,51,0.06)',
              boxSizing: 'border-box' as const,
            }}
          />
        </div>
      </form>

      {/* Departments */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#2A1153' }}>
            {locale === 'pt' ? 'Departamentos' : locale === 'es' ? 'Departamentos' : 'Departments'}
          </h2>
          <span style={{ flex: 1, height: 1, background: 'rgba(28,18,51,0.08)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {DEPARTMENTS.map((d) => (
            <Link
              key={d.slug}
              href={`/${locale}/departments/${d.slug}`}
              style={{
                display: 'block', padding: '16px 18px',
                borderRadius: 14, background: '#fff',
                border: '1px solid rgba(28,18,51,0.07)',
                textDecoration: 'none', transition: 'box-shadow 0.15s',
                borderTop: `3px solid ${d.accent}`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2A1153', marginBottom: 4 }}>
                {getDeptName(d, locale)}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(28,18,51,0.5)', lineHeight: 1.4 }}>
                {getDeptDesc(d, locale)}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently updated */}
      {recent && recent.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#2A1153' }}>
              {locale === 'pt' ? 'Atualizados recentemente' : locale === 'es' ? 'Actualizados recientemente' : 'Recently updated'}
            </h2>
            <span style={{ flex: 1, height: 1, background: 'rgba(28,18,51,0.08)' }} />
            <Link href={`/${locale}/wiki`} style={{ fontSize: 12, color: '#4B1A77', textDecoration: 'none' }}>
              {locale === 'pt' ? 'Ver todos →' : locale === 'es' ? 'Ver todos →' : 'View all →'}
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recent.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/wiki/${item.slug}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 10, background: '#fff',
                  border: '1px solid rgba(28,18,51,0.06)',
                  textDecoration: 'none', transition: 'background 0.1s',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#2A1153', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {titleFor(item)}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(28,18,51,0.45)', marginTop: 2 }}>
                    {deptLabel(item.department_id)} · {item.content_type ?? 'process'}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(28,18,51,0.35)', whiteSpace: 'nowrap' }}>
                  {item.updated_at
                    ? new Date(item.updated_at).toLocaleDateString(
                        locale === 'pt' ? 'pt-BR' : 'en-AU',
                        { day: '2-digit', month: 'short' }
                      )
                    : ''}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {canWrite && (
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(28,18,51,0.08)' }}>
          <Link
            href={`/${locale}/wiki/new`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 10, fontWeight: 600, fontSize: 14,
              background: '#2A1153', color: '#fff', textDecoration: 'none', fontFamily: 'Outfit, sans-serif',
            }}
          >
            + {locale === 'pt' ? 'Novo conteúdo' : 'New content'}
          </Link>
        </div>
      )}
    </div>
  )
}
