import Link from 'next/link'
import { getUser } from '@/lib/auth/get-user'
import { DEPARTMENTS, getDeptDesc, getDeptName } from '@/lib/constants/departments'

interface DepartmentsPageProps {
  params: Promise<{ locale: string }>
}

export default async function DepartmentsPage({ params }: DepartmentsPageProps) {
  const { locale } = await params
  await getUser(locale)

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4B1A77' }}>
          Movy Internal Hub
        </div>
        <h1 style={{ margin: '6px 0 4px', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#2A1153' }}>
          {locale === 'pt' ? 'Departamentos' : locale === 'es' ? 'Departamentos' : 'Departments'}
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(28,18,51,0.62)', maxWidth: 620, lineHeight: 1.5 }}>
          {locale === 'pt'
            ? 'Acesse processos, documentos e atalhos por area operacional.'
            : locale === 'es'
              ? 'Accede a procesos, documentos y accesos por area operativa.'
              : 'Access processes, documents and shortcuts by operating area.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
        {DEPARTMENTS.map((dept) => (
          <Link
            key={dept.slug}
            href={`/${locale}/departments/${dept.slug}`}
            style={{
              display: 'block',
              padding: '18px 20px',
              borderRadius: 14,
              background: '#fff',
              border: '1px solid rgba(28,18,51,0.07)',
              borderTop: `4px solid ${dept.accent}`,
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(28,18,51,0.04)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: dept.accent, marginBottom: 8 }}>
              {dept.pillar}
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#2A1153' }}>
              {getDeptName(dept, locale)}
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(28,18,51,0.6)', lineHeight: 1.5 }}>
              {getDeptDesc(dept, locale)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
