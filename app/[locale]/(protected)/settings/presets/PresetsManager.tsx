'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { createPreset, updatePreset, deletePreset, type PresetInput, type PresetResult } from './actions'
import type { DbPreset } from '@/lib/study-plans/presets'
import { color, ink, font, t } from '@/lib/ui/theme'
import { Button, EmptyState, Modal } from '@/components/ui'

const TYPE_LABEL: Record<string, string> = { elicos: 'ELICOS', vet: 'VET', he: 'Higher Education' }
const TYPE_COLOR: Record<string, string> = { elicos: color.purple, vet: color.orange, he: color.gold }
const ORDER = ['elicos', 'vet', 'he'] as const

// Shared inline input style — field-control focus ring via className
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${color.line}`,
  background: 'var(--surface)', fontSize: 13, color: t.text, fontFamily: font.ui, outline: 'none',
}

// Danger confirmation modal
function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Remover',
  pending,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  pending?: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={400}>
      <p style={{ margin: '0 0 20px', fontSize: 13.5, color: t.textMuted, lineHeight: 1.55 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          style={{
            padding: '9px 16px', borderRadius: 10, border: 'none',
            background: color.red, color: '#fff',
            fontSize: 13, fontWeight: 700, fontFamily: font.ui,
            cursor: pending ? 'wait' : 'pointer', opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? 'Aguarde…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export function PresetsManager({ presets, serviceConfigured = true }: { presets: DbPreset[]; serviceConfigured?: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null)

  // Confirm-modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    title: string
    message: string
    confirmLabel: string
    onConfirm: () => void
  }>({ open: false, title: '', message: '', confirmLabel: 'Remover', onConfirm: () => {} })

  function run(fn: () => Promise<PresetResult>, okMsg: string) {
    setFlash(null)
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        setFlash({ kind: 'ok', msg: okMsg })
        router.refresh()
      } else {
        setFlash({ kind: 'err', msg: res.error ?? 'Erro inesperado.' })
      }
    })
  }

  function confirmDelete(preset: DbPreset) {
    setConfirmModal({
      open: true,
      title: 'Remover preset',
      message: `Remover ${preset.provider} — ${preset.name}?`,
      confirmLabel: 'Remover',
      onConfirm: () => run(() => deletePreset(preset.id), 'Preset removido.'),
    })
  }

  const totalPresets = presets.length

  return (
    <div className="movy-stagger" style={{ display: 'grid', gap: 22 }}>
      <ConfirmModal
        open={confirmModal.open}
        onClose={() => setConfirmModal((s) => ({ ...s, open: false }))}
        onConfirm={() => {
          setConfirmModal((s) => ({ ...s, open: false }))
          confirmModal.onConfirm()
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        pending={pending}
      />

      {!serviceConfigured && (
        <div style={{ padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'rgba(243,107,28,0.08)', color: '#B8480F', border: '1px solid rgba(243,107,28,0.25)', lineHeight: 1.5 }}>
          Gestão de presets indisponível: defina <code style={{ fontWeight: 800 }}>SUPABASE_SERVICE_ROLE_KEY</code> no servidor e faça um novo deploy.
        </div>
      )}
      {flash && (
        <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: flash.kind === 'ok' ? 'rgba(75,26,119,0.08)' : 'rgba(210,59,43,0.1)', color: flash.kind === 'ok' ? color.purple : '#D23B2B', border: `1px solid ${flash.kind === 'ok' ? 'rgba(75,26,119,0.2)' : 'rgba(210,59,43,0.25)'}` }}>
          {flash.msg}
        </div>
      )}

      {totalPresets === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum preset cadastrado"
          description="Adicione presets de cursos abaixo em cada categoria."
        />
      ) : null}

      {ORDER.map((type) => {
        const typePresets = presets.filter((p) => p.type === type)
        return (
          <section key={type} className="movy-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span className="movy-kicker" style={{ color: TYPE_COLOR[type] }}>{TYPE_LABEL[type]}</span>
              <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: ink(0.35) }}>
                {String(typePresets.length).padStart(2, '0')}
              </span>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {typePresets.map((p) => (
                <PresetRow key={p.id} preset={p} pending={pending} onRun={run} onDeleteConfirm={confirmDelete} />
              ))}
            </div>
            <AddPreset type={type} pending={pending} onRun={run} />
          </section>
        )
      })}
    </div>
  )
}

function PresetRow({
  preset,
  pending,
  onRun,
  onDeleteConfirm,
}: {
  preset: DbPreset
  pending: boolean
  onRun: (fn: () => Promise<PresetResult>, msg: string) => void
  onDeleteConfirm: (preset: DbPreset) => void
}) {
  const [p, setP] = useState(preset)
  const dirty = JSON.stringify(p) !== JSON.stringify(preset)
  const isElicos = preset.type === 'elicos'

  function field<K extends keyof DbPreset>(k: K, v: DbPreset[K]) {
    setP((cur) => ({ ...cur, [k]: v }))
  }

  return (
    <div style={{ border: `1px solid ${color.line}`, borderRadius: 12, padding: 12, display: 'grid', gap: 8 }}>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <Cell label="Escola">
          <input
            className="movy-field-control"
            style={inputStyle}
            value={p.provider}
            onChange={(e) => field('provider', e.target.value)}
            aria-label="Escola"
          />
        </Cell>
        <Cell label="Curso">
          <input
            className="movy-field-control"
            style={inputStyle}
            value={p.name}
            onChange={(e) => field('name', e.target.value)}
            aria-label="Curso"
          />
        </Cell>
        {isElicos ? (
          <Cell label="Valor/semana"><Num value={p.rate_per_week} onChange={(v) => field('rate_per_week', v)} label="Valor por semana" /></Cell>
        ) : (
          <Cell label="Tuition total"><Num value={p.tuition} onChange={(v) => field('tuition', v)} label="Tuition total" /></Cell>
        )}
        <Cell label="Matrícula"><Num value={p.enrolment_fee} onChange={(v) => field('enrolment_fee', v)} label="Matrícula" /></Cell>
        <Cell label="Material"><Num value={p.material_fee} onChange={(v) => field('material_fee', v)} label="Material" /></Cell>
        <Cell label="Parcelas"><Num value={p.payment_parts} onChange={(v) => field('payment_parts', v)} label="Parcelas" /></Cell>
        <Cell label="Frequência">
          <input
            className="movy-field-control"
            style={inputStyle}
            value={p.payment_frequency}
            onChange={(e) => field('payment_frequency', e.target.value)}
            aria-label="Frequência de pagamento"
          />
        </Cell>
        {isElicos && <Cell label="Entrada (sem)"><Num value={p.deposit_weeks} onChange={(v) => field('deposit_weeks', v)} label="Entrada em semanas" /></Cell>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button
          type="button"
          variant="primary"
          disabled={pending || !dirty}
          onClick={() => onRun(() => updatePreset(preset.id, {
            provider: p.provider, name: p.name, rate_per_week: p.rate_per_week, tuition: p.tuition,
            enrolment_fee: p.enrolment_fee, material_fee: p.material_fee, scholarship: p.scholarship,
            payment_parts: p.payment_parts, payment_frequency: p.payment_frequency, deposit_weeks: p.deposit_weeks,
            has_material: p.has_material, timetable: p.timetable,
          }), 'Preset atualizado.')}
          loading={pending && dirty}
        >
          {dirty ? 'Salvar' : 'Salvo'}
        </Button>
        <button
          type="button"
          aria-label={`Remover preset ${preset.provider} — ${preset.name}`}
          disabled={pending}
          onClick={() => onDeleteConfirm(preset)}
          style={{
            padding: '8px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 700,
            fontFamily: font.ui, cursor: pending ? 'not-allowed' : 'pointer',
            background: 'var(--surface)', color: '#D23B2B',
            border: '1px solid rgba(210,59,43,0.3)',
            opacity: pending ? 0.5 : 1,
          }}
        >
          Remover
        </button>
      </div>
    </div>
  )
}

function AddPreset({ type, pending, onRun }: { type: string; pending: boolean; onRun: (fn: () => Promise<PresetResult>, msg: string) => void }) {
  const [open, setOpen] = useState(false)
  const [provider, setProvider] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          marginTop: 12, padding: '8px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 700,
          fontFamily: font.ui, cursor: 'pointer', background: 'var(--surface)',
          color: t.accent, border: `1px dashed ${color.line}`,
        }}
      >
        + Adicionar preset
      </button>
    )
  }

  const isElicos = type === 'elicos'
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const base: PresetInput = {
          type, provider, name,
          rate_per_week: isElicos ? price : 0, tuition: isElicos ? 0 : price,
          enrolment_fee: 250, material_fee: 0, has_material: false, scholarship: 0,
          timetable: '', payment_parts: 4, payment_frequency: '', deposit_weeks: isElicos ? 3 : 0,
        }
        onRun(() => createPreset(base), 'Preset criado.')
        setProvider(''); setName(''); setPrice(0); setOpen(false)
      }}
      style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}
    >
      <Cell label="Escola">
        <input required className="movy-field-control" style={inputStyle} value={provider} onChange={(e) => setProvider(e.target.value)} aria-label="Escola" />
      </Cell>
      <Cell label="Curso">
        <input required className="movy-field-control" style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} aria-label="Curso" />
      </Cell>
      <Cell label={isElicos ? 'Valor/semana' : 'Tuition total'}>
        <Num value={price} onChange={setPrice} label={isElicos ? 'Valor por semana' : 'Tuition total'} />
      </Cell>
      <Button type="submit" variant="primary" loading={pending}>Criar</Button>
      <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
    </form>
  )
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 4, minWidth: 0 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: ink(0.45), textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      {children}
    </label>
  )
}

function Num({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <input
      type="number"
      step="1"
      aria-label={label}
      className="movy-field-control"
      style={{ ...inputStyle, textAlign: 'right' }}
      value={value}
      onChange={(e) => {
        const n = Number.parseFloat(e.target.value)
        onChange(Number.isFinite(n) ? n : 0)
      }}
    />
  )
}
