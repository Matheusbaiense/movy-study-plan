import Link from 'next/link'
import { getUser } from '@/lib/auth/get-user'
import { DEPARTMENTS, getDeptDesc, getDeptName } from '@/lib/constants/departments'
import { ink, font, accentRamp, t } from '@/lib/ui/theme'

interface DepartmentsPageProps {
  params: Promise<{ locale: string }>
}

export default async function DepartmentsPage({ params }: DepartmentsPageProps) {
  const { locale } = await params
  await getUser(locale)
  const isEn = locale === 'en'

  return (
    <div className="movy-stagger" style={{ display: 'grid', gap: 24 }}>
      <div>
        <div className="movy-kicker">
          Movy Internal Hub
        </div>
        <h1 style={{ margin: '8px 0 6px', fontFamily: font.display, fontSize: 'clamp(28px, 3.4vw, 38px)', fontWeight: 800, letterSpacing: '-0.04em', color: t.text }}>
          {isEn ? 'Areas' : 'Áreas'}
        </h1>
        <p style={{ margin: 0, fontSize: 14.5, color: ink(0.62), maxWidth: 620, lineHeight: 1.55 }}>
          {locale === 'pt'
            ? 'Processos, documentos e conhecimento operacional da Movy, organizados por área.'
            : locale === 'es'
              ? 'Procesos, documentos y conocimiento operativo de Movy, organizados por área.'
              : 'Movy processes, documents and operational knowledge, organised by area.'}
        </p>
      </div>

      <div style={{ display: 'grid', gap: 12 }} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {DEPARTMENTS.map((dept, i) => {
          const accent = dept.accent ?? accentRamp[i % accentRamp.length]
          return (
            <Link
              key={dept.slug}
              href={`/${locale}/departments/${dept.slug}`}
              prefetch={false}
              className="movy-card movy-card--hover"
              style={{
                position: 'relative',
                display: 'block',
                minHeight: 132,
                padding: '18px 20px 18px 22px',
                textDecoration: 'none',
                overflow: 'hidden',
              }}
            >
              <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent }} />
              <div className="movy-kicker" style={{ color: accent, fontSize: 10, marginBottom: 8 }}>
                {dept.pillar}
              </div>
              <h2 style={{ margin: '0 0 6px', fontFamily: font.display, fontSize: 18, fontWeight: 800, letterSpacing: '-0.015em', color: t.text }}>
                {getDeptName(dept, locale)}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: ink(0.58), lineHeight: 1.5 }}>
                {getDeptDesc(dept, locale)}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
