import Link from 'next/link'
import { getUser } from '@/lib/auth/get-user'
import { createClient } from '@/lib/supabase/server'
import { DEPARTMENTS, getDeptDesc, getDeptName } from '@/lib/constants/departments'
import { color, ink, font, accentRamp } from '@/lib/ui/theme'
import { createStudyPlan } from '../study-plans/actions'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const { profile } = await getUser(locale)
  const supabase = await createClient()

  const firstName = (profile.full_name ?? profile.email).split(' ')[0]
  const isEn = locale === 'en'

  const { data: recent } = await supabase
    .from('contents')
    .select('id, slug, title_pt, title_en, title_es, summary, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(5)

  const titleFor = (item: NonNullable<typeof recent>[number]) =>
    locale === 'en' ? item.title_en || item.title_pt
    : locale === 'es' ? item.title_es || item.title_pt
    : item.title_pt

  return (
    <div className="movy-stagger" style={{ display: 'grid', gap: 26 }}>
      {/* Hero */}
      <section style={{ position: 'relative' }}>
        <div className="movy-kicker" style={{ color: color.purple }}>
          Movy Internal Hub · {isEn ? 'Internal Portal' : 'Portal interno'}
        </div>
        <h1
          style={{
            margin: '10px 0 8px',
            fontFamily: font.display,
            fontSize: 'clamp(30px, 4vw, 44px)',
            fontWeight: 800,
            letterSpacing: '-0.045em',
            lineHeight: 1.02,
            color: color.purpleDeep,
          }}
        >
          {isEn ? 'Welcome back, ' : 'Bem-vindo, '}
          <span style={{ color: color.purple }}>{firstName}</span>
        </h1>
        <p style={{ margin: 0, maxWidth: 620, color: ink(0.6), fontSize: 15, lineHeight: 1.6 }}>
          {isEn
            ? 'Build proposals and browse the internal knowledge base. We move people.'
            : 'Crie propostas e consulte a base de informações interna. We move people.'}
        </p>
      </section>

      {/* Feature bento — Proposta (hero) + Informações */}
      <section style={{ display: 'grid', gap: 14 }} className="grid-cols-1 lg:grid-cols-3">
        {/* Proposta — dominant, dark, with motif */}
        <div
          className="lg:col-span-2 movy-card--hover"
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: 26,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #2A1153 0%, #190A38 100%)',
            color: '#fff',
            border: `1px solid ${ink(0.08)}`,
            boxShadow: '0 1px 2px rgba(42,17,83,0.04), 0 18px 46px -18px rgba(42,17,83,0.4)',
          }}
        >
          {/* corner staircase motif */}
          <svg
            width="200" height="200" viewBox="0 0 200 200" fill="none" aria-hidden
            style={{ position: 'absolute', right: -24, bottom: -28, opacity: 0.16 }}
          >
            <rect x="20" y="140" width="34" height="40" rx="4" fill="#FBB615" />
            <rect x="58" y="104" width="34" height="76" rx="4" fill="#F36B1C" />
            <rect x="96" y="68" width="34" height="112" rx="4" fill="#FBB615" />
            <rect x="134" y="32" width="34" height="148" rx="4" fill="#F9F9F9" />
          </svg>

          <div className="movy-kicker" style={{ color: color.gold, position: 'relative' }}>
            {isEn ? 'Proposals' : 'Propostas'}
          </div>
          <h2 style={{ margin: '12px 0 8px', fontFamily: font.display, fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', position: 'relative' }}>
            {isEn ? 'Proposal builder' : 'Criador de proposta'}
          </h2>
          <p style={{ margin: '0 0 20px', maxWidth: 420, color: 'rgba(255,255,255,0.72)', fontSize: 13.5, lineHeight: 1.6, position: 'relative' }}>
            {isEn
              ? 'Simulate ELICOS, VET and Higher Education with fees, materials and per-course costs.'
              : 'Simule ELICOS, VET e Higher Education com taxas, materiais e custos por curso.'}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', position: 'relative' }}>
            <form action={createStudyPlan.bind(null, locale)}>
              <button
                style={{
                  border: 0,
                  borderRadius: 11,
                  padding: '11px 18px',
                  background: color.orange,
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  fontFamily: font.display,
                  boxShadow: '0 8px 22px -8px rgba(243,107,28,0.7)',
                }}
              >
                {isEn ? 'New proposal' : 'Nova proposta'}
              </button>
            </form>
            <Link
              href={`/${locale}/study-plans`}
              prefetch={false}
              style={{
                borderRadius: 11,
                padding: '11px 16px',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: 13,
                fontFamily: font.display,
                border: '1px solid rgba(255,255,255,0.14)',
              }}
            >
              {isEn ? 'View proposals' : 'Ver propostas'}
            </Link>
          </div>
        </div>

        {/* Informações */}
        <Link
          href={`/${locale}/wiki`}
          prefetch={false}
          className="movy-card movy-card--hover"
          style={{ display: 'flex', flexDirection: 'column', padding: 24, textDecoration: 'none' }}
        >
          <div className="movy-kicker" style={{ color: color.purple }}>
            {isEn ? 'Knowledge' : 'Informações'}
          </div>
          <h2 style={{ margin: '12px 0 8px', fontFamily: font.display, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: color.purpleDeep }}>
            {isEn ? 'Knowledge base' : 'Base de Informações'}
          </h2>
          <p style={{ margin: '0 0 18px', color: ink(0.6), fontSize: 13.5, lineHeight: 1.6 }}>
            {isEn
              ? 'Processes, templates, visas, support, policies and Movy links.'
              : 'Processos, templates, vistos, suporte, políticas e links da Movy.'}
          </p>
          <span style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, color: color.purple, fontWeight: 800, fontSize: 13, fontFamily: font.display }}>
            {isEn ? 'Open knowledge' : 'Abrir informações'}
            <Arrow />
          </span>
        </Link>
      </section>

      {/* Áreas — editorial grid with a featured cell */}
      <section>
        <SectionHeader title={isEn ? 'Areas' : 'Áreas'} />
        <div style={{ display: 'grid', gap: 12 }} className="grid-cols-2 lg:grid-cols-4">
          {DEPARTMENTS.map((dept, i) => {
            const accent = dept.accent ?? accentRamp[i % accentRamp.length]
            const featured = i === 0
            return (
              <Link
                key={dept.slug}
                href={`/${locale}/departments/${dept.slug}`}
                prefetch={false}
                className={`movy-card movy-card--hover ${featured ? 'col-span-2 lg:col-span-2' : ''}`}
                style={{
                  position: 'relative',
                  display: 'block',
                  minHeight: featured ? 132 : 116,
                  padding: '16px 18px 16px 20px',
                  textDecoration: 'none',
                  overflow: 'hidden',
                }}
              >
                {/* left accent rail */}
                <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent }} />
                <div className="movy-kicker" style={{ color: accent, fontSize: 10, marginBottom: 8 }}>
                  {dept.pillar}
                </div>
                <div style={{ fontFamily: font.display, fontSize: featured ? 18 : 15, fontWeight: 800, color: color.purpleDeep, marginBottom: 5, letterSpacing: '-0.01em' }}>
                  {getDeptName(dept, locale)}
                </div>
                <div style={{ fontSize: 12, color: ink(0.56), lineHeight: 1.45, maxWidth: featured ? 360 : undefined }}>
                  {getDeptDesc(dept, locale)}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Recently updated */}
      {recent && recent.length > 0 && (
        <section>
          <SectionHeader title={isEn ? 'Recently updated' : 'Atualizados recentemente'} />
          <div style={{ display: 'grid', gap: 8 }}>
            {recent.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/wiki/${item.slug}`}
                prefetch={false}
                className="movy-card--hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '13px 16px',
                  borderRadius: 13,
                  background: '#fff',
                  border: `1px solid ${color.line}`,
                  textDecoration: 'none',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: 999, background: color.gold, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700, color: color.purpleDeep, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {titleFor(item)}
                  </div>
                  {item.summary && (
                    <div style={{ marginTop: 2, fontSize: 12, color: ink(0.5), lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.summary}
                    </div>
                  )}
                </div>
                {item.updated_at && (
                  <span style={{ fontFamily: font.mono, fontSize: 11, color: ink(0.4), flexShrink: 0 }}>
                    {new Date(item.updated_at).toLocaleDateString(locale === 'en' ? 'en-AU' : 'pt-BR', { day: '2-digit', month: 'short' })}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
      <h2 className="movy-kicker" style={{ margin: 0, color: color.purpleDeep, fontSize: 12 }}>
        {title}
      </h2>
      <span style={{ flex: 1, height: 1, background: color.line }} />
    </div>
  )
}

function Arrow() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}
