import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { isEditorOrAbove, isAdminOrAbove } from '@/lib/permissions/can'
import { WikiContent } from '@/components/wiki/WikiContent'
import { BlockRenderer } from '@/components/wiki/BlockRenderer'
import { DeleteContentButton } from '@/components/wiki/DeleteContentButton'
import type { Block } from '@/types/blocks'

interface WikiSlugPageProps {
  params: Promise<{ locale: string; slug: string }>
}

const STATUS_STYLES = {
  published: { bg: 'rgba(75,26,119,0.12)', fg: '#4B1A77', dot: '#4B1A77' },
  draft:     { bg: 'rgba(243,107,28,0.14)', fg: '#F36B1C', dot: '#F36B1C' },
  archived:  { bg: 'rgba(28,18,51,0.08)',   fg: '#2A1153', dot: '#2A1153' },
}

const DEPT_ACCENTS: Record<string, string> = {
  commercial: '#4B1A77',
  'student-support': '#F36B1C',
  visa: '#FBB615',
  marketing: '#3A1560',
  technology: '#2A1153',
  finance: '#FFC51C',
  administrative: '#5A4E72',
}

export default async function WikiSlugPage({ params }: WikiSlugPageProps) {
  const { locale, slug } = await params
  const { profile } = await getUser(locale)
  const supabase = await createClient()

  const { data: content } = await supabase
    .from('contents')
    .select('*, departments(slug, name_pt, name_en, name_es, color, icon)')
    .eq('slug', slug)
    .single()

  if (!content) notFound()

  if (content.status !== 'published' && !isEditorOrAbove(profile.role)) {
    notFound()
  }

  const canEdit = isEditorOrAbove(profile.role)
  const canDelete = isAdminOrAbove(profile.role)

  const title =
    locale === 'en' ? (content.title_en ?? content.title_pt) :
    locale === 'es' ? (content.title_es ?? content.title_pt) :
    content.title_pt

  const body =
    locale === 'en' ? (content.body_en ?? content.body_pt ?? '') :
    locale === 'es' ? (content.body_es ?? content.body_pt ?? '') :
    (content.body_pt ?? '')

  const dept = content.departments

  const deptName = dept
    ? (locale === 'en' ? dept.name_en : locale === 'es' ? dept.name_es : dept.name_pt)
    : null

  const accent = dept?.color ?? DEPT_ACCENTS[dept?.slug ?? ''] ?? '#2A1153'
  const statusStyle = STATUS_STYLES[content.status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.draft

  const updatedAt = content.updated_at
    ? new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(content.updated_at))
    : null

  const hasLang = {
    pt: !!content.title_pt,
    en: !!content.title_en,
    es: !!content.title_es,
  }

  const { data: progress } = await supabase
    .from('checklist_progress')
    .select('checked_items')
    .eq('content_id', content.id)
    .eq('user_id', profile.id)
    .single()

  const blocks: Block[] = Array.isArray(content.blocks) ? content.blocks as unknown as Block[] : []
  const hasBlocks = blocks.length > 0
  const initialChecked: Record<string, string[]> = {}
  if (progress?.checked_items && hasBlocks) {
    for (const block of blocks) {
      if (block.type === 'checklist') {
        initialChecked[block.id] = progress.checked_items
      }
    }
  }

  const { data: related = [] } = await supabase
    .from('contents')
    .select('slug, title_pt, title_en, title_es, department_id')
    .eq('status', 'published')
    .neq('slug', slug)
    .limit(3)

  return (
    <div>
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(28,18,51,0.55)', marginBottom: 16 }}>
        <Link href={`/${locale}/home`} style={{ color: 'inherit', textDecoration: 'none', fontFamily: 'Outfit, sans-serif' }}>
          {locale === 'pt' ? 'Início' : 'Home'}
        </Link>
        <ChevronIcon />
        <Link href={`/${locale}/wiki`} style={{ color: 'inherit', textDecoration: 'none', fontFamily: 'Outfit, sans-serif' }}>
          Wiki
        </Link>
        <ChevronIcon />
        <span style={{ color: '#2A1153', fontWeight: 500, fontFamily: 'Outfit, sans-serif' }}>{title}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'flex-start' }}>
        {/* Main article */}
        <div style={{
          background: '#fff', borderRadius: 18, padding: '32px 36px',
          border: '1px solid rgba(28,18,51,0.06)', boxShadow: '0 1px 2px rgba(28,18,51,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            {/* Dept chip */}
            {deptName && (
              <Link
                href={`/${locale}/departments/${dept?.slug}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                  background: `${accent}14`, color: accent, textDecoration: 'none',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 999, background: accent }} />
                {deptName}
              </Link>
            )}
            {/* Status badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              background: statusStyle.bg, color: statusStyle.fg,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: statusStyle.dot }} />
              {content.status === 'published'
                ? (locale === 'pt' ? 'Publicado' : 'Published')
                : content.status === 'draft'
                ? (locale === 'pt' ? 'Rascunho' : 'Draft')
                : (locale === 'pt' ? 'Arquivado' : 'Archived')}
            </span>
          </div>

          <h1 style={{ margin: '0 0 10px', fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', color: '#2A1153', lineHeight: 1.1 }}>
            {title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'rgba(28,18,51,0.6)', marginBottom: 24 }}>
            {updatedAt && (
              <span>{locale === 'pt' ? 'Atualizado em' : 'Updated'} {updatedAt}</span>
            )}
            {content.tags && content.tags.length > 0 && (
              <>
                <span>·</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {content.tags.map((tag) => (
                    <span key={tag} style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 6,
                      background: 'rgba(28,18,51,0.05)', color: 'rgba(28,18,51,0.7)', fontWeight: 500,
                    }}>#{tag}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {hasBlocks ? (
            <BlockRenderer
              blocks={blocks}
              contentId={content.id}
              initialChecked={initialChecked}
            />
          ) : (
            <WikiContent html={body} />
          )}

          {/* Edit/delete actions */}
          {canEdit && (
            <div style={{ display: 'flex', gap: 8, marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(28,18,51,0.06)' }}>
              <Link
                href={`/${locale}/wiki/${slug}/edit`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 10, fontWeight: 600, fontSize: 13,
                  background: 'rgba(28,18,51,0.05)', color: '#2A1153', border: '1px solid transparent',
                  textDecoration: 'none', fontFamily: 'Outfit, sans-serif',
                }}
              >
                <EditIcon />
                {locale === 'pt' ? 'Editar' : 'Edit'}
              </Link>
              {canDelete && (
                <DeleteContentButton id={content.id} locale={locale} />
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 24 }}>
          {/* Available languages */}
          <div style={{
            background: '#fff', borderRadius: 18, padding: '16px 18px',
            border: '1px solid rgba(28,18,51,0.06)', boxShadow: '0 1px 2px rgba(28,18,51,0.04)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(28,18,51,0.5)', marginBottom: 10 }}>
              {locale === 'pt' ? 'Idiomas disponíveis' : 'Available languages'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {([['pt', 'Português'], ['en', 'English'], ['es', 'Español']] as const).map(([code, label]) => (
                <div key={code} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: 8,
                  background: locale === code ? 'rgba(75,26,119,0.08)' : 'transparent',
                }}>
                  <span style={{ fontSize: 13, fontWeight: locale === code ? 600 : 500, color: '#2A1153' }}>{label}</span>
                  {hasLang[code]
                    ? <CheckIcon />
                    : <span style={{ fontSize: 11, color: 'rgba(28,18,51,0.45)' }}>fallback → PT</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Related */}
          {(related?.length ?? 0) > 0 && (
            <div style={{
              background: '#fff', borderRadius: 18, padding: '16px 18px',
              border: '1px solid rgba(28,18,51,0.06)', boxShadow: '0 1px 2px rgba(28,18,51,0.04)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(28,18,51,0.5)', marginBottom: 10 }}>
                {locale === 'pt' ? 'Relacionados' : 'Related'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(related ?? []).map((r) => {
                  const rTitle = locale === 'en' ? (r.title_en ?? r.title_pt) : locale === 'es' ? (r.title_es ?? r.title_pt) : r.title_pt
                  return (
                    <Link
                      key={r.slug}
                      href={`/${locale}/wiki/${r.slug}`}
                      style={{
                        display: 'block', padding: '8px 10px', borderRadius: 8,
                        background: 'transparent', textDecoration: 'none', fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#2A1153', marginBottom: 2 }}>{rTitle}</div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Back */}
          <div style={{
            background: '#fff', borderRadius: 18, padding: '14px 18px',
            border: '1px solid rgba(28,18,51,0.06)', boxShadow: '0 1px 2px rgba(28,18,51,0.04)',
          }}>
            <Link
              href={`/${locale}/wiki`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 13, fontWeight: 500, color: 'rgba(28,18,51,0.7)',
                textDecoration: 'none', fontFamily: 'Outfit, sans-serif',
              }}
            >
              <BackIcon />
              {locale === 'pt' ? 'Voltar ao Wiki' : locale === 'es' ? 'Volver al Wiki' : 'Back to Wiki'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChevronIcon() {
  return <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
}
function CheckIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#4B1A77" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
}
function EditIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function BackIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7"/></svg>
}
