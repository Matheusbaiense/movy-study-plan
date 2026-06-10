import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { isEditorOrAbove } from '@/lib/permissions/can'
import { CategorySection } from '@/components/departments/CategorySection'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export default async function DepartmentPage({ params }: Props) {
  const { locale, slug } = await params
  const { profile } = await getUser(locale)
  const supabase = await createClient()

  const { data: dept } = await supabase
    .from('departments')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!dept) notFound()

  const { data: contents } = await supabase
    .from('contents')
    .select('id, slug, title_pt, title_en, title_es, summary, content_type, category, read_minutes, updated_at')
    .eq('department_id', dept.id)
    .eq('status', 'published')
    .order('category', { ascending: true })
    .order('title_pt', { ascending: true })

  const grouped: Record<string, NonNullable<typeof contents>> = {}
  for (const c of contents ?? []) {
    const key = c.category ?? 'Geral'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(c)
  }

  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, avatar_url')
    .eq('department', slug)
    .eq('is_active', true)

  const deptName = locale === 'en' ? dept.name_en : locale === 'es' ? dept.name_es : dept.name_pt
  const deptDesc = locale === 'en' ? (dept.description_en ?? '') : locale === 'es' ? (dept.description_es ?? '') : (dept.description_pt ?? '')
  const totalContent = contents?.length ?? 0
  const canWrite = isEditorOrAbove(profile.role)

  const TYPE_LABELS: Record<string, string> = {
    process: 'Processo', template: 'Template', training: 'Treinamento',
    login: 'Login', policy: 'Política', faq: 'FAQ', checklist: 'Checklist', reference: 'Referência',
  }

  return (
    <div>
      {/* Hero */}
      <div style={{
        borderRadius: 20, padding: '32px 36px', marginBottom: 32,
        position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${dept.color}18 0%, ${dept.color}08 100%)`,
        border: `1px solid ${dept.color}30`,
      }}>
        <div style={{ position: 'absolute', right: 24, top: 24, fontSize: 48, opacity: 0.3 }}>{dept.icon}</div>
        <div style={{
          display: 'inline-block', padding: '3px 10px', borderRadius: 20,
          background: dept.color ?? '#2A1153', color: '#fff',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', marginBottom: 12,
        }}>
          {dept.icon} {deptName}
        </div>
        <h1 style={{ margin: '0 0 10px', fontSize: 28, fontWeight: 700, color: '#2A1153', letterSpacing: '-0.02em' }}>
          {deptName}
        </h1>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: 'rgba(28,18,51,0.6)', lineHeight: 1.6, maxWidth: 560 }}>
          {deptDesc}
        </p>
        <div style={{ display: 'flex', gap: 20 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: dept.color ?? '#2A1153' }}>{totalContent}</div>
            <div style={{ fontSize: 11, color: 'rgba(28,18,51,0.5)' }}>{locale === 'pt' ? 'documentos' : 'documents'}</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: dept.color ?? '#2A1153' }}>{members?.length ?? 0}</div>
            <div style={{ fontSize: 11, color: 'rgba(28,18,51,0.5)' }}>{locale === 'pt' ? 'membros' : 'members'}</div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
        {/* Content by category */}
        <div>
          {Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'rgba(28,18,51,0.4)', fontSize: 14 }}>
              {locale === 'pt' ? 'Nenhum conteúdo publicado ainda.' : 'No published content yet.'}
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <CategorySection
                key={category}
                category={category}
                items={items}
                locale={locale}
                deptColor={dept.color ?? '#2A1153'}
                typeLabels={TYPE_LABELS}
              />
            ))
          )}
          {canWrite && (
            <div style={{ marginTop: 20 }}>
              <Link
                href={`/${locale}/wiki/new`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '9px 16px', borderRadius: 10, fontWeight: 600, fontSize: 13,
                  background: dept.color ?? '#2A1153', color: '#fff',
                  textDecoration: 'none',
                }}
              >
                + {locale === 'pt' ? 'Novo documento' : 'New document'}
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {members && members.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid rgba(28,18,51,0.07)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(28,18,51,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                {locale === 'pt' ? 'Time' : 'Team'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {members.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: dept.color ?? '#2A1153',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>
                      {(m.full_name ?? m.email).slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#2A1153' }}>
                        {m.full_name ?? m.email.split('@')[0]}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(28,18,51,0.45)', textTransform: 'capitalize' }}>
                        {m.role.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid rgba(28,18,51,0.07)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(28,18,51,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              {locale === 'pt' ? 'Ações' : 'Actions'}
            </div>
            <Link href={`/${locale}/wiki?dept=${slug}`} style={{ display: 'block', fontSize: 13, color: dept.color ?? '#4B1A77', textDecoration: 'none', marginBottom: 8, fontWeight: 500 }}>
              → {locale === 'pt' ? 'Ver na wiki' : 'View in wiki'}
            </Link>
            <Link href={`/${locale}/search?dept=${slug}`} style={{ display: 'block', fontSize: 13, color: dept.color ?? '#4B1A77', textDecoration: 'none', fontWeight: 500 }}>
              → {locale === 'pt' ? 'Buscar neste dept' : 'Search this dept'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
