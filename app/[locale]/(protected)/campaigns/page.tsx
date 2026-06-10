import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { isEditorOrAbove } from '@/lib/permissions/can'
import { STATUS_STYLES, getStatusLabel } from '@/lib/constants/content'
import { DEPT_ACCENT } from '@/lib/constants/departments'
import type { Tables } from '@/types/supabase'

interface CampaignsPageProps {
  params: Promise<{ locale: string }>
}

type Campaign = Tables<'campaigns'> & {
  departments: Pick<Tables<'departments'>, 'slug' | 'name_pt' | 'name_en' | 'name_es' | 'color'> | null
}

export default async function CampaignsPage({ params }: CampaignsPageProps) {
  const { locale } = await params
  const { profile } = await getUser(locale)
  const supabase = await createClient()

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, departments(slug, name_pt, name_en, name_es, color)')
    .order('created_at', { ascending: false })

  const items = (campaigns ?? []) as Campaign[]
  const canWrite = isEditorOrAbove(profile.role)

  function deptName(c: Campaign) {
    if (!c.departments) return ''
    if (locale === 'en') return c.departments.name_en ?? c.departments.name_pt
    if (locale === 'es') return c.departments.name_es ?? c.departments.name_pt
    return c.departments.name_pt
  }

  const label = {
    title:   locale === 'pt' ? 'Campanhas' : locale === 'es' ? 'Campañas' : 'Campaigns',
    subtitle: locale === 'pt' ? 'Gestão de campanhas de marketing e comunicação.' : locale === 'es' ? 'Gestión de campañas de marketing y comunicación.' : 'Marketing and communication campaign management.',
    new:     locale === 'pt' ? 'Nova campanha' : locale === 'es' ? 'Nueva campaña' : 'New campaign',
    empty:   locale === 'pt' ? 'Nenhuma campanha encontrada.' : locale === 'es' ? 'No se encontraron campañas.' : 'No campaigns found.',
    updated: locale === 'pt' ? 'Atualizado' : locale === 'es' ? 'Actualizado' : 'Updated',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B5CF6' }}>Marketing</div>
          <h1 style={{ margin: '6px 0 4px', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#2A1153' }}>{label.title}</h1>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(28,18,51,0.6)' }}>{label.subtitle}</p>
        </div>
        {canWrite && (
          <button
            disabled
            title="Em breve"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 12, fontWeight: 600, fontSize: 14,
              background: 'rgba(28,18,51,0.1)', color: 'rgba(28,18,51,0.4)',
              border: '1px dashed rgba(28,18,51,0.2)',
              fontFamily: 'Outfit, sans-serif', cursor: 'not-allowed',
            }}
          >
            <PlusIcon />
            {label.new}
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.length === 0 ? (
          <div style={{
            padding: 60, textAlign: 'center', color: 'rgba(28,18,51,0.5)',
            background: '#fff', borderRadius: 18, border: '1px solid rgba(28,18,51,0.06)',
          }}>
            <MegaphoneIcon large />
            <div style={{ marginTop: 10, fontSize: 14 }}>{label.empty}</div>
          </div>
        ) : (
          items.map((campaign) => {
            const deptSlug = campaign.departments?.slug ?? ''
            const accent = campaign.departments?.color ?? DEPT_ACCENT[deptSlug] ?? '#8B5CF6'
            const statusStyle = STATUS_STYLES[campaign.status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.draft
            const updatedDate = campaign.updated_at
              ? new Date(campaign.updated_at).toLocaleDateString(
                  locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-AU',
                  { day: '2-digit', month: 'short' }
                )
              : ''

            return (
              <div
                key={campaign.id}
                style={{
                  display: 'flex', gap: 18, alignItems: 'center',
                  padding: '18px 20px', borderRadius: 18,
                  background: '#fff', border: '1px solid rgba(28,18,51,0.06)',
                  boxShadow: '0 1px 2px rgba(28,18,51,0.04)',
                }}
              >
                {/* Icon */}
                <span style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${accent}14`,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <MegaphoneIcon color={accent} />
                </span>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    {campaign.departments && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                        background: `${accent}14`, color: accent,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: accent }} />
                        {deptName(campaign)}
                      </span>
                    )}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                      background: statusStyle.bg, color: statusStyle.fg,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: statusStyle.dot }} />
                      {getStatusLabel(campaign.status, locale)}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#2A1153' }}>
                    {campaign.title}
                  </h3>
                  {campaign.description && (
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(28,18,51,0.6)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {campaign.description}
                    </p>
                  )}

                  {updatedDate && (
                    <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(28,18,51,0.5)' }}>
                      {label.updated} {updatedDate}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function MegaphoneIcon({ color = 'rgba(28,18,51,0.5)', large }: { color?: string; large?: boolean }) {
  const size = large ? 28 : 18
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M3 10v4l11 5V5L3 10z"/><path d="M14 8a4 4 0 0 1 0 8"/></svg>
}

function PlusIcon() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
}
