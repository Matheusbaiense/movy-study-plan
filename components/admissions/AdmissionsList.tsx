'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Lock, Search, Plus, Users } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Select } from '@/components/ui/form'
import { t, ink, font, color, radius } from '@/lib/ui/theme'
import type { SchoolAdmissionView, Stream } from '@/lib/admissions/types'
import { upsertAdmissionAction } from '@/app/[locale]/(protected)/admissions/actions'

const STREAM_LABEL: Record<Stream, string> = { english: 'English', vet: 'VET', he: 'Higher Ed' }

interface Props {
  locale: string
  admissions: SchoolAdmissionView[]
  addableInstitutions: { id: string; name: string }[]
  canEdit: boolean
}

export function AdmissionsList({ locale, admissions, addableInstitutions, canEdit }: Props) {
  const [q, setQ] = useState('')
  const router = useRouter()
  const [addOpen, setAddOpen] = useState(false)
  const [institutionId, setInstitutionId] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return admissions
    return admissions.filter((a) => (a.institution?.name ?? '').toLowerCase().includes(needle))
  }, [admissions, q])

  function handleAdd() {
    if (!institutionId) return
    setError(null)
    startTransition(async () => {
      try {
        const { id } = await upsertAdmissionAction({ institution_id: institutionId, streams: [], documents: [], contacts: [] })
        setAddOpen(false)
        router.push(`/${locale}/admissions/${id}`)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao criar')
      }
    })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admissions"
        title={locale === 'pt' ? 'Matrículas por escola' : 'Enrolment by school'}
        description={
          locale === 'pt'
            ? 'Instruções de matrícula, documentos, portal e contatos de cada escola parceira.'
            : 'Enrolment instructions, documents, portal and contacts for each partner school.'
        }
        actions={
          canEdit && addableInstitutions.length > 0 ? (
            <Button variant="primary" onClick={() => setAddOpen(true)}>
              <Plus size={16} /> {locale === 'pt' ? 'Adicionar escola' : 'Add school'}
            </Button>
          ) : undefined
        }
      />

      <div style={{ position: 'relative', maxWidth: 420, marginBottom: 22 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.textMuted }} />
        <input
          className="movy-field-control"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={locale === 'pt' ? 'Buscar escola…' : 'Search school…'}
          aria-label={locale === 'pt' ? 'Buscar escola' : 'Search school'}
          style={{ width: '100%', paddingLeft: 36 }}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={locale === 'pt' ? 'Nenhuma escola encontrada' : 'No schools found'}
          description={
            admissions.length === 0
              ? locale === 'pt'
                ? 'Ainda não há instruções de admissão cadastradas.'
                : 'No admissions instructions yet.'
              : locale === 'pt'
                ? 'Tente outro termo de busca.'
                : 'Try a different search term.'
          }
        />
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filtered.map((a) => (
            <Link
              key={a.id}
              href={`/${locale}/admissions/${a.id}`}
              className="movy-card"
              style={{ display: 'block', padding: 18, textDecoration: 'none', color: 'inherit', borderRadius: radius.md }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <h3 style={{ margin: 0, fontFamily: font.display, fontSize: 17, color: t.text, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.institution?.name ?? '—'}
                </h3>
                {a.hasCredential && (
                  <span title={locale === 'pt' ? 'Possui portal' : 'Has portal'} style={{ color: color.gold, flexShrink: 0 }}>
                    <Lock size={15} />
                  </span>
                )}
              </div>
              {a.enrolment_type && (
                <p style={{ margin: '6px 0 0', fontFamily: font.body, fontSize: 13, color: t.textMuted }}>{a.enrolment_type}</p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                {a.streamsTyped.map((s) => (
                  <span key={s} style={chip}>
                    {STREAM_LABEL[s]}
                  </span>
                ))}
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: t.textMuted, fontFamily: font.body }}>
                  <Users size={13} /> {a.contactsParsed.length}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={locale === 'pt' ? 'Adicionar escola' : 'Add school'} width={420}>
        <Field label={locale === 'pt' ? 'Instituição (do Portfólio)' : 'Institution (from Portfolio)'}>
          <Select value={institutionId} onChange={(e) => setInstitutionId(e.target.value)}>
            <option value="">{locale === 'pt' ? 'Selecione…' : 'Select…'}</option>
            {addableInstitutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </Select>
        </Field>
        {error && <p style={{ color: color.red, fontSize: 13, margin: '8px 0 0' }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <Button variant="secondary" onClick={() => setAddOpen(false)}>
            {locale === 'pt' ? 'Cancelar' : 'Cancel'}
          </Button>
          <Button variant="primary" onClick={handleAdd} loading={pending} disabled={!institutionId}>
            {locale === 'pt' ? 'Criar' : 'Create'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

const chip: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 9px',
  borderRadius: 999,
  fontSize: 11.5,
  fontFamily: font.body,
  fontWeight: 600,
  color: color.purple,
  background: ink(0.05),
  border: `1px solid ${ink(0.08)}`,
}
