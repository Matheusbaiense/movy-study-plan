import Link from 'next/link'
import { Plus, Search, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { isEditorOrAbove } from '@/lib/permissions/can'
import { WikiListItem } from '@/components/wiki/WikiListItem'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { DEPARTMENTS, DEPT_ACCENT, getDeptNameBySlug } from '@/lib/constants/departments'
import { font } from '@/lib/ui/theme'
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
    // Replace tags with a space (not '') so adjacent blocks don't run together,
    // then collapse the resulting whitespace before truncating.
    return body
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120)
  }

  function deptDisplayName(c: Content) {
    if (!c.departments) return ''
    if (locale === 'en') return c.departments.name_en ?? c.departments.name_pt
    if (locale === 'es') return c.departments.name_es ?? c.departments.name_pt
    return c.departments.name_pt
  }

  const pageTitle = locale === 'en' ? 'Knowledge Base' : 'Informações'
  const pageDescription = `${items.length} ${locale === 'pt' ? 'processos' : locale === 'es' ? 'procesos' : 'processes'}`

  return (
    <div className="movy-stagger">
      <PageHeader
        title={pageTitle}
        eyebrow="Movy Internal Hub"
        description={pageDescription}
        actions={
          canWrite ? (
            <Link href={`/${locale}/wiki/new`} prefetch={false} className="button-fill-primary-md">
              <Plus size={16} strokeWidth={2.4} aria-hidden />
              {locale === 'pt' ? 'Novo conteudo' : locale === 'es' ? 'Nuevo contenido' : 'New content'}
            </Link>
          ) : undefined
        }
      />

      {/* Search + filters */}
      <div className="movy-card" style={{ padding: 14, marginBottom: 18 }}>
        <form method="GET">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px' }}>
            <Search size={18} strokeWidth={1.8} aria-hidden className="color-fg-soft" />
            <input
              name="search"
              defaultValue={search}
              placeholder={locale === 'pt' ? 'Pesquisar informacoes...' : locale === 'es' ? 'Buscar informacion...' : 'Search knowledge...'}
              className="movy-field-control"
              style={{
                flex: 1, border: 'none', outline: 'none', fontSize: 15,
                color: 'var(--text)', background: 'transparent', fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              name="dept"
              defaultValue={dept ?? ''}
              className="movy-field-control"
              style={{
                padding: '7px 12px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--surface)', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-body)',
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
                className="movy-field-control"
                style={{
                  padding: '7px 12px', borderRadius: 10, border: '1px solid var(--border)',
                  background: 'var(--surface)', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                }}
              >
                <option value="">{locale === 'pt' ? 'Status: Todos' : 'Status: All'}</option>
                <option value="published">{locale === 'pt' ? 'Publicado' : 'Published'}</option>
                <option value="draft">{locale === 'pt' ? 'Rascunho' : 'Draft'}</option>
                <option value="archived">{locale === 'pt' ? 'Arquivado' : 'Archived'}</option>
              </select>
            )}

            <button type="submit" className="button-fill-primary-md" style={{ height: 34, padding: '0 14px', fontSize: 13 }}>
              {locale === 'pt' ? 'Filtrar' : locale === 'es' ? 'Filtrar' : 'Filter'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.length === 0 ? (
          <EmptyState
            icon={search ? Search : BookOpen}
            title={
              search
                ? (locale === 'pt' ? 'Nenhum resultado.' : locale === 'es' ? 'Sin resultados.' : 'No matches.')
                : (locale === 'pt' ? 'Nenhum artigo ainda.' : locale === 'es' ? 'Sin artículos aún.' : 'No articles yet.')
            }
            description={
              search
                ? (locale === 'pt' ? `Nenhum artigo encontrado para "${search}".` : `No articles found for "${search}".`)
                : undefined
            }
            action={
              canWrite ? (
                <Link
                  href={`/${locale}/wiki/new`}
                  prefetch={false}
                  className="button-fill-primary-md"
                >
                  <Plus size={14} strokeWidth={2.4} aria-hidden />
                  {locale === 'pt' ? 'Criar o primeiro artigo' : 'Create the first article'}
                </Link>
              ) : undefined
            }
          />
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
