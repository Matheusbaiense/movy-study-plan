import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { isEditorOrAbove } from '@/lib/permissions/can'
import { WikiListItem } from '@/components/wiki/WikiListItem'
import { DEPARTMENTS, DEPT_ACCENT, getDeptNameBySlug } from '@/lib/constants/departments'
import type { Tables } from '@/types/supabase'

interface WikiPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ dept?: string; search?: string; status?: string }>
}

type Content = Tables<'contents'> & {
  departments: Pick<Tables<'departments'>, 'slug' | 'name_pt' | 'name_en' | 'name_es' | 'color' | 'icon'> | null
}

export default async function WikiPage({ params, searchParams }: WikiPageProps) {
  const { locale } = await params
  const { dept, search, status } = await searchParams
  const { profile } = await getUser(locale)
  const supabase = await createClient()

  let query = supabase
    .from('contents')
    .select('*, departments(slug, name_pt, name_en, name_es, color, icon)')
    .order('is_featured', { ascending: false })
    .order('updated_at', { ascending: false })

  if (!isEditorOrAbove(profile.role) || !status) {
    query = query.eq('status', 'published')
  } else if (status) {
    query = query.eq('status', status as 'draft' | 'published' | 'archived')
  }

  if (dept) {
    const { data: deptRow } = await supabase
      .from('departments')
      .select('id')
      .eq('slug', dept)
      .single()
    if (deptRow?.id) query = query.eq('department_id', deptRow.id)
  }

  if (search) {
    query = query.or(`title_pt.ilike.%${search}%,title_en.ilike.%${search}%,title_es.ilike.%${search}%`)
  }

  const { data: contents } = await query
  const items = (contents ?? []) as Content[]
  const canWrite = isEditorOrAbove(profile.role)

  function contentTitle(c: Content) {
    if (locale === 'en') return c.title_en ?? c.title_pt
    if (locale === 'es') return c.title_es ?? c.title_pt
    return c.title_pt
  }

  function contentExcerpt(c: Content) {
    const body = locale === 'en' ? (c.body_en ?? c.body_pt) : locale === 'es' ? (c.body_es ?? c.body_pt) : c.body_pt
    if (!body) return ''
    return body.replace(/<[^>]+>/g, '').slice(0, 120)
  }

  function deptDisplayName(c: Content) {
    if (!c.departments) return ''
    if (locale === 'en') return c.departments.name_en ?? c.departments.name_pt
    if (locale === 'es') return c.departments.name_es ?? c.departments.name_pt
    return c.departments.name_pt
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4B1A77' }}>Movy Internal Hub</div>
          <h1 style={{ margin: '6px 0 4px', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#2A1153' }}>
            {locale === 'en' ? 'Knowledge Base' : 'Informações'}
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(28,18,51,0.6)' }}>
            {items.length} {locale === 'pt' ? 'processos' : locale === 'es' ? 'procesos' : 'processes'}
          </p>
        </div>
        {canWrite && (
          <Link
            href={`/${locale}/wiki/new`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 12, fontWeight: 600, fontSize: 14,
              background: '#2A1153', color: '#fff', border: '1px solid #2A1153',
              textDecoration: 'none', fontFamily: 'Outfit, sans-serif',
            }}
          >
            <PlusIcon />
            {locale === 'pt' ? 'Novo conteudo' : locale === 'es' ? 'Nuevo contenido' : 'New content'}
          </Link>
        )}
      </div>

      {/* Search + filters */}
      <div style={{
        background: '#fff', borderRadius: 18, padding: 14, marginBottom: 18,
        border: '1px solid rgba(28,18,51,0.06)', boxShadow: '0 1px 2px rgba(28,18,51,0.04)',
      }}>
        <form method="GET">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px' }}>
            <SearchIcon />
            <input
              name="search"
              defaultValue={search}
              placeholder={locale === 'pt' ? 'Pesquisar informacoes...' : locale === 'es' ? 'Buscar informacion...' : 'Search knowledge...'}
              style={{
                flex: 1, border: 'none', outline: 'none', fontSize: 15,
                color: '#2A1153', background: 'transparent', fontFamily: 'Outfit, system-ui, sans-serif',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(28,18,51,0.06)', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              name="dept"
              defaultValue={dept ?? ''}
              style={{
                padding: '7px 12px', borderRadius: 10, border: '1px solid rgba(28,18,51,0.1)',
                background: '#fff', fontSize: 13, color: '#2A1153', fontFamily: 'Outfit, system-ui, sans-serif',
                cursor: 'pointer',
              }}
            >
              <option value="">{locale === 'pt' ? 'Departamento: Todos' : locale === 'es' ? 'Departamento: Todos' : 'Department: All'}</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {locale === 'en' ? d.name_en : locale === 'es' ? d.name_es : d.name_pt}
                </option>
              ))}
            </select>

            {canWrite && (
              <select
                name="status"
                defaultValue={status ?? ''}
                style={{
                  padding: '7px 12px', borderRadius: 10, border: '1px solid rgba(28,18,51,0.1)',
                  background: '#fff', fontSize: 13, color: '#2A1153', fontFamily: 'Outfit, system-ui, sans-serif',
                  cursor: 'pointer',
                }}
              >
                <option value="">{locale === 'pt' ? 'Status: Todos' : 'Status: All'}</option>
                <option value="published">{locale === 'pt' ? 'Publicado' : 'Published'}</option>
                <option value="draft">{locale === 'pt' ? 'Rascunho' : 'Draft'}</option>
                <option value="archived">{locale === 'pt' ? 'Arquivado' : 'Archived'}</option>
              </select>
            )}

            <button
              type="submit"
              style={{
                padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(28,18,51,0.1)',
                background: '#2A1153', color: '#fff', fontSize: 13, fontWeight: 600,
                fontFamily: 'Outfit, system-ui, sans-serif', cursor: 'pointer',
              }}
            >
              {locale === 'pt' ? 'Filtrar' : locale === 'es' ? 'Filtrar' : 'Filter'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.length === 0 ? (
          <div style={{
            padding: 60, textAlign: 'center', color: 'rgba(28,18,51,0.5)',
            background: '#fff', borderRadius: 18, border: '1px solid rgba(28,18,51,0.06)',
          }}>
            <SearchIcon large />
            <div style={{ marginTop: 10, fontSize: 14 }}>
              {locale === 'pt' ? 'Nenhum resultado.' : locale === 'es' ? 'Sin resultados.' : 'No matches.'}
            </div>
            {canWrite && (
              <Link
                href={`/${locale}/wiki/new`}
                style={{ marginTop: 12, display: 'inline-block', fontSize: 13, color: '#4B1A77', textDecoration: 'underline' }}
              >
                {locale === 'pt' ? 'Criar o primeiro artigo' : 'Create the first article'}
              </Link>
            )}
          </div>
        ) : (
          items.map((content) => {
            const deptSlug = content.departments?.slug ?? ''
            const accent = content.departments?.color ?? DEPT_ACCENT[deptSlug] ?? '#2A1153'
            const updatedDate = content.updated_at
              ? new Date(content.updated_at).toLocaleDateString(
                  locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-AU',
                  { day: '2-digit', month: 'short' }
                )
              : ''

            return (
              <WikiListItem
                key={content.id}
                href={`/${locale}/wiki/${content.slug}`}
                accent={accent}
                deptName={deptDisplayName(content)}
                status={content.status}
                title={contentTitle(content) ?? ''}
                excerpt={contentExcerpt(content)}
                updatedDate={updatedDate}
                tags={content.tags}
                locale={locale}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

function PlusIcon() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
}

function SearchIcon({ large }: { large?: boolean }) {
  const size = large ? 28 : 18
  const color = large ? 'rgba(28,18,51,0.3)' : 'rgba(28,18,51,0.5)'
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg>
}
