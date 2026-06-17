'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Building2, Plus, Search, BookOpen, Globe, MapPin } from 'lucide-react'
import { font, ink, t } from '@/lib/ui/theme'
import { createInstitutionAction, updateInstitutionAction, type InstitutionInput } from '@/app/[locale]/(protected)/portfolio/actions'
import type { Institution } from '@/lib/portfolio/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/form'
import { InstitutionModal } from './InstitutionModal'

interface Props {
  institutions: Institution[]
  courseCountMap: Record<string, number>
}

const PARTNERSHIP_LABELS: Record<string, string> = {
  active: 'Ativo',
  negotiating: 'Negociando',
  inactive: 'Inativo',
}

const PARTNERSHIP_COLORS: Record<string, string> = {
  active: '#16a34a',
  negotiating: '#d97706',
  inactive: '#9ca3af',
}

function countryFlag(country: string) {
  if (country.length !== 2) return ''
  const base = 0x1f1e6
  return String.fromCodePoint(base + country.charCodeAt(0) - 65, base + country.charCodeAt(1) - 65)
}

export function PortfolioPage({ institutions, courseCountMap }: Props) {
  const params = useParams()
  const locale = (params.locale as string) || 'pt'

  const [q, setQ] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Institution | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = institutions.filter((i) =>
    i.name.toLowerCase().includes(q.toLowerCase()) ||
    (i.city ?? '').toLowerCase().includes(q.toLowerCase()) ||
    (i.country ?? '').toLowerCase().includes(q.toLowerCase()),
  )

  function openCreate() { setEditing(null); setError(null); setShowModal(true) }
  function openEdit(inst: Institution) { setEditing(inst); setError(null); setShowModal(true) }
  function closeModal() { setShowModal(false); setEditing(null); setError(null) }

  function handleSave(input: InstitutionInput) {
    startTransition(async () => {
      try {
        if (editing) {
          await updateInstitutionAction(editing.id, input)
        } else {
          await createInstitutionAction(input)
        }
        closeModal()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao salvar')
      }
    })
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>
      <PageHeader
        title="Portfólio de Escolas"
        description={`${institutions.length} instituição${institutions.length !== 1 ? 'es' : ''} · ${Object.values(courseCountMap).reduce((a, b) => a + b, 0)} cursos ativos`}
        actions={
          <Button variant="primary" type="button" onClick={openCreate}>
            <Plus size={14} strokeWidth={2.5} />
            Nova escola
          </Button>
        }
      />

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: ink(0.4) }} />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, cidade ou país…"
          style={{ paddingLeft: 32 }}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 16, padding: '8px 14px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={q ? 'Nenhuma escola encontrada.' : 'Nenhuma escola cadastrada ainda.'}
          description={q ? 'Tente outro termo de busca.' : undefined}
          action={!q ? <Button variant="primary" type="button" onClick={openCreate}><Plus size={14} />Nova escola</Button> : undefined}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map((inst) => (
            <InstitutionCard
              key={inst.id}
              institution={inst}
              courseCount={courseCountMap[inst.id] ?? 0}
              locale={locale}
              onEdit={() => openEdit(inst)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <InstitutionModal
        open={showModal}
        initial={editing}
        isPending={isPending}
        onSave={handleSave}
        onClose={closeModal}
      />
    </div>
  )
}

function InstitutionCard({ institution: inst, courseCount, locale, onEdit }: {
  institution: Institution
  courseCount: number
  locale: string
  onEdit: () => void
}) {
  const status = inst.partnership_status || 'active'

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ padding: '16px 18px 12px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{countryFlag(inst.country)}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: font.display, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {inst.name}
              </div>
              {inst.city && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                  <MapPin size={10} style={{ color: ink(0.4), flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: ink(0.5) }}>{inst.city}</span>
                </div>
              )}
            </div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: `${PARTNERSHIP_COLORS[status]}18`, color: PARTNERSHIP_COLORS[status], whiteSpace: 'nowrap', flexShrink: 0 }}>
            {PARTNERSHIP_LABELS[status] ?? status}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: ink(0.55) }}>
            <BookOpen size={12} />
            {courseCount} curso{courseCount !== 1 ? 's' : ''}
          </span>
          {inst.website && (
            <a href={inst.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: ink(0.45), textDecoration: 'none' }}>
              <Globe size={11} />
              site
            </a>
          )}
          {inst.prices_valid_until && (
            <PriceExpiryBadge until={inst.prices_valid_until} />
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <Link
          href={`/${locale}/portfolio/${inst.id}`}
          style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 700, padding: '6px 0', borderRadius: 7, background: 'var(--surface-sunken)', border: '1px solid var(--border)', color: t.text, textDecoration: 'none' }}
        >
          Gerenciar
        </Link>
        <Button type="button" variant="secondary" onClick={onEdit}>
          Editar
        </Button>
      </div>
    </div>
  )
}

function PriceExpiryBadge({ until }: { until: string }) {
  const daysLeft = Math.ceil((new Date(until).getTime() - Date.now()) / 86400000)
  if (daysLeft > 30) return null
  const color = daysLeft <= 0 ? '#dc2626' : '#d97706'
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}14`, padding: '2px 6px', borderRadius: 5 }}>
      {daysLeft <= 0 ? 'Preços vencidos' : `Vence em ${daysLeft}d`}
    </span>
  )
}


