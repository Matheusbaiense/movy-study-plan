import Link from 'next/link'
import { getUser } from '@/lib/auth/get-user'
import { createClient } from '@/lib/supabase/server'
import { DEPARTMENTS, getDeptDesc, getDeptName } from '@/lib/constants/departments'
import { createStudyPlan } from '../study-plans/actions'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const { profile } = await getUser(locale)
  const supabase = await createClient()

  const firstName = (profile.full_name ?? profile.email).split(' ')[0]

  const { data: recent } = await supabase
    .from('contents')
    .select('id, slug, title_pt, title_en, title_es, summary, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(5)

  const titleFor = (item: NonNullable<typeof recent>[number]) =>
    locale === 'en' ? (item.title_en || item.title_pt)
    : locale === 'es' ? (item.title_es || item.title_pt)
    : item.title_pt

  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <section>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4B1A77' }}>
          Movy Internal Hub
        </div>
        <h1 style={{ margin: '8px 0 6px', fontSize: 34, fontWeight: 800, letterSpacing: '-0.04em', color: '#2A1153' }}>
          {locale === 'en' ? `Welcome, ${firstName}` : `Bem-vindo, ${firstName}`}
        </h1>
        <p style={{ margin: 0, maxWidth: 680, color: 'rgba(28,18,51,0.64)', fontSize: 15, lineHeight: 1.6 }}>
          {locale === 'en'
            ? 'Use this hub for proposals and the internal knowledge base. Everything else was removed from the main workflow.'
            : 'Use este portal para criar propostas e consultar a base de informações interna. O resto saiu do fluxo principal.'}
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        <div style={{ padding: 22, borderRadius: 16, background: '#2A1153', color: '#fff', border: '1px solid rgba(28,18,51,0.08)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FBB615', marginBottom: 10 }}>
            Propostas
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Criador de proposta
          </h2>
          <p style={{ margin: '0 0 18px', color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 1.55 }}>
            Simule ELICOS, VET e Higher Education com taxas, materiais e custos por curso.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <form action={createStudyPlan.bind(null, locale)}>
              <button
                style={{
                  border: 0,
                  borderRadius: 10,
                  padding: '10px 14px',
                  background: '#F36B1C',
                  color: '#fff',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                Nova proposta
              </button>
            </form>
            <Link
              href={`/${locale}/study-plans`}
              style={{
                borderRadius: 10,
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: 13,
              }}
            >
              Ver propostas
            </Link>
          </div>
        </div>

        <div style={{ padding: 22, borderRadius: 16, background: '#fff', border: '1px solid rgba(28,18,51,0.08)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4B1A77', marginBottom: 10 }}>
            Informacoes
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#2A1153' }}>
            Base de Informações
          </h2>
          <p style={{ margin: '0 0 18px', color: 'rgba(28,18,51,0.62)', fontSize: 13, lineHeight: 1.55 }}>
            Processos, templates, vistos, suporte, políticas, links e atendimentos da Movy.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href={`/${locale}/wiki`}
              style={{
                borderRadius: 10,
                padding: '10px 14px',
                background: '#2A1153',
                color: '#fff',
                fontWeight: 800,
                textDecoration: 'none',
                fontSize: 13,
              }}
            >
              Abrir informacoes
            </Link>
            <Link
              href={`/${locale}/search`}
              style={{
                borderRadius: 10,
                padding: '10px 14px',
                background: 'rgba(75,26,119,0.08)',
                color: '#4B1A77',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: 13,
              }}
            >
              Pesquisar
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#2A1153' }}>
            Áreas
          </h2>
          <span style={{ flex: 1, height: 1, background: 'rgba(28,18,51,0.08)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {DEPARTMENTS.map((dept) => (
            <Link
              key={dept.slug}
              href={`/${locale}/departments/${dept.slug}`}
              style={{
                display: 'block',
                minHeight: 118,
                padding: '16px 18px',
                borderRadius: 14,
                background: '#fff',
                border: '1px solid rgba(28,18,51,0.07)',
                textDecoration: 'none',
                borderTop: `4px solid ${dept.accent}`,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: dept.accent, marginBottom: 8 }}>
                {dept.pillar}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#2A1153', marginBottom: 5 }}>
                {getDeptName(dept, locale)}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(28,18,51,0.58)', lineHeight: 1.45 }}>
                {getDeptDesc(dept, locale)}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {recent && recent.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#2A1153' }}>
              Atualizados recentemente
            </h2>
            <span style={{ flex: 1, height: 1, background: 'rgba(28,18,51,0.08)' }} />
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {recent.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/wiki/${item.slug}`}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: '#fff',
                  border: '1px solid rgba(28,18,51,0.06)',
                  textDecoration: 'none',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, color: '#2A1153' }}>{titleFor(item)}</div>
                {item.summary && (
                  <div style={{ marginTop: 3, fontSize: 12, color: 'rgba(28,18,51,0.54)', lineHeight: 1.5 }}>
                    {item.summary}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
