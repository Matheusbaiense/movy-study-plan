import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { isAdminOrAbove } from '@/lib/permissions/can'
import { DEPARTMENTS, getDeptName } from '@/lib/constants/departments'
import type { Tables } from '@/types/supabase'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; dept?: string; type?: string }>
}

type SearchContent = Pick<
  Tables<'contents'>,
  'id' | 'slug' | 'title_pt' | 'title_en' | 'title_es' | 'summary' | 'content_type' | 'department_id' | 'status' | 'updated_at'
> & {
  departments: Pick<Tables<'departments'>, 'slug' | 'name_pt' | 'name_en' | 'name_es'> | null
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { q, dept, type } = await searchParams
  const { profile } = await getUser(locale)
  const supabase = await createClient()
  const isAdmin = isAdminOrAbove(profile.role)

  let query = supabase
    .from('contents')
    .select('id, slug, title_pt, title_en, title_es, summary, content_type, department_id, status, updated_at, departments(slug, name_pt, name_en, name_es)')
    .order('updated_at', { ascending: false })
    .limit(40)

  if (!isAdmin) query = query.eq('status', 'published')

  if (dept) {
    const { data: deptRow } = await supabase
      .from('departments')
      .select('id')
      .eq('slug', dept)
      .maybeSingle()

    query = deptRow?.id
      ? query.eq('department_id', deptRow.id)
      : query.eq('department_id', '00000000-0000-0000-0000-000000000000')
  }

  if (type) query = query.eq('content_type', type)

  const { data } = await query
  const items = (data ?? []) as SearchContent[]

  const results = q && q.length > 1
    ? items.filter((item) => {
        const haystack = [item.title_pt, item.title_en, item.title_es, item.summary]
          .join(' ')
          .toLowerCase()
        return q.toLowerCase().split(' ').every((word) => haystack.includes(word))
      })
    : items

  const titleFor = (item: SearchContent) =>
    locale === 'en' ? (item.title_en || item.title_pt)
    : locale === 'es' ? (item.title_es || item.title_pt)
    : item.title_pt

  const deptLabel = (item: SearchContent) => {
    const department = item.departments
    if (department) {
      if (locale === 'en') return department.name_en ?? department.name_pt
      if (locale === 'es') return department.name_es ?? department.name_pt
      return department.name_pt
    }

    return item.department_id ?? '-'
  }

  const TYPE_OPTIONS = ['process', 'template', 'training', 'policy', 'faq', 'checklist', 'reference', 'login']
  const DEPT_OPTIONS = DEPARTMENTS.map((d) => ({ slug: d.slug, label: getDeptName(d, locale) }))

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2A1153', marginBottom: 20 }}>
        {locale === 'pt' ? 'Busca' : locale === 'es' ? 'Busqueda' : 'Search'}
      </h1>

      <form method="GET" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(28,18,51,0.4)' }} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input
            name="q"
            defaultValue={q}
            placeholder={locale === 'pt' ? 'Buscar...' : 'Search...'}
            style={{
              width: '100%', padding: '12px 14px 12px 40px',
              borderRadius: 12, border: '1.5px solid rgba(28,18,51,0.12)',
              fontSize: 14, fontFamily: 'Outfit, sans-serif',
              background: '#fff', color: '#2A1153', outline: 'none',
              boxSizing: 'border-box' as const,
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            name="dept"
            defaultValue={dept ?? ''}
            style={{
              flex: 1, padding: '9px 12px', borderRadius: 10,
              border: '1px solid rgba(28,18,51,0.12)', fontSize: 13,
              fontFamily: 'Outfit, sans-serif', background: '#fff', color: '#2A1153',
            }}
          >
            <option value="">{locale === 'pt' ? 'Todos os departamentos' : 'All departments'}</option>
            {DEPT_OPTIONS.map((d) => <option key={d.slug} value={d.slug}>{d.label}</option>)}
          </select>
          <select
            name="type"
            defaultValue={type ?? ''}
            style={{
              flex: 1, padding: '9px 12px', borderRadius: 10,
              border: '1px solid rgba(28,18,51,0.12)', fontSize: 13,
              fontFamily: 'Outfit, sans-serif', background: '#fff', color: '#2A1153',
            }}
          >
            <option value="">{locale === 'pt' ? 'Todos os tipos' : 'All types'}</option>
            {TYPE_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button
            type="submit"
            style={{
              padding: '9px 18px', borderRadius: 10, background: '#2A1153',
              color: '#fff', border: 'none', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
            }}
          >
            {locale === 'pt' ? 'Buscar' : 'Search'}
          </button>
        </div>
      </form>

      {(q || dept || type) && (
        <p style={{ fontSize: 13, color: 'rgba(28,18,51,0.5)', marginBottom: 16 }}>
          {results.length} {locale === 'pt' ? 'resultado(s)' : 'result(s)'}
          {q ? ` para "${q}"` : ''}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {results.map((item) => (
          <Link
            key={item.id}
            href={`/${locale}/wiki/${item.slug}`}
            style={{
              display: 'block', padding: '14px 16px', borderRadius: 12,
              background: '#fff', border: '1px solid rgba(28,18,51,0.07)',
              textDecoration: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{
                fontSize: 11, fontWeight: 600, background: 'rgba(28,18,51,0.07)',
                color: '#2A1153', padding: '2px 8px', borderRadius: 6,
              }}>
                {deptLabel(item)}
              </span>
              {item.content_type && (
                <span style={{
                  fontSize: 11, fontWeight: 600, background: '#F36B1C18',
                  color: '#F36B1C', padding: '2px 8px', borderRadius: 6,
                }}>
                  {item.content_type}
                </span>
              )}
              {isAdmin && item.status !== 'published' && (
                <span style={{ fontSize: 11, color: '#D23B2B' }}>{item.status}</span>
              )}
            </div>
            <div style={{
              fontSize: 15, fontWeight: 500, color: '#2A1153',
              marginBottom: item.summary ? 4 : 0,
            }}>
              {titleFor(item)}
            </div>
            {item.summary && (
              <div style={{ fontSize: 13, color: 'rgba(28,18,51,0.5)', lineHeight: 1.5 }}>
                {item.summary}
              </div>
            )}
          </Link>
        ))}
        {results.length === 0 && (q || dept || type) && (
          <div style={{ textAlign: 'center', padding: 48, color: 'rgba(28,18,51,0.4)', fontSize: 14 }}>
            {locale === 'pt' ? 'Nenhum resultado encontrado.' : 'No results found.'}
          </div>
        )}
      </div>
    </div>
  )
}
