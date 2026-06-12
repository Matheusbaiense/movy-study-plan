'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPreset, updatePreset, deletePreset, type PresetInput, type PresetResult } from './actions'
import type { DbPreset } from '@/lib/study-plans/presets'
import { color, ink, font } from '@/lib/ui/theme'

const TYPE_LABEL: Record<string, string> = { elicos: 'ELICOS', vet: 'VET', he: 'Higher Education' }
const TYPE_COLOR: Record<string, string> = { elicos: color.purple, vet: color.orange, he: color.gold }
const ORDER = ['elicos', 'vet', 'he'] as const

export function PresetsManager({ presets, serviceConfigured = true }: { presets: DbPreset[]; serviceConfigured?: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null)

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

  return (
    <div className="movy-stagger" style={{ display: 'grid', gap: 22 }}>
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

      {ORDER.map((type) => (
        <section key={type} className="movy-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span className="movy-kicker" style={{ color: TYPE_COLOR[type] }}>{TYPE_LABEL[type]}</span>
            <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: ink(0.35) }}>
              {String(presets.filter((p) => p.type === type).length).padStart(2, '0')}
            </span>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {presets.filter((p) => p.type === type).map((p) => (
              <PresetRow key={p.id} preset={p} pending={pending} onRun={run} />
            ))}
          </div>
          <AddPreset type={type} pending={pending} onRun={run} />
        </section>
      ))}
    </div>
  )
}

function PresetRow({ preset, pending, onRun }: { preset: DbPreset; pending: boolean; onRun: (fn: () => Promise<PresetResult>, msg: string) => void }) {
  const [p, setP] = useState(preset)
  const dirty = JSON.stringify(p) !== JSON.stringify(preset)
  const isElicos = preset.type === 'elicos'

  function field<K extends keyof DbPreset>(k: K, v: DbPreset[K]) {
    setP((cur) => ({ ...cur, [k]: v }))
  }

  return (
    <div style={{ border: `1px solid ${color.line}`, borderRadius: 12, padding: 12, display: 'grid', gap: 8 }}>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <Cell label="Escola"><input style={input} value={p.provider} onChange={(e) => field('provider', e.target.value)} /></Cell>
        <Cell label="Curso"><input style={input} value={p.name} onChange={(e) => field('name', e.target.value)} /></Cell>
        {isElicos ? (
          <Cell label="Valor/semana"><Num value={p.rate_per_week} onChange={(v) => field('rate_per_week', v)} /></Cell>
        ) : (
          <Cell label="Tuition total"><Num value={p.tuition} onChange={(v) => field('tuition', v)} /></Cell>
        )}
        <Cell label="Matrícula"><Num value={p.enrolment_fee} onChange={(v) => field('enrolment_fee', v)} /></Cell>
        <Cell label="Material"><Num value={p.material_fee} onChange={(v) => field('material_fee', v)} /></Cell>
        <Cell label="Parcelas"><Num value={p.payment_parts} onChange={(v) => field('payment_parts', v)} /></Cell>
        <Cell label="Frequência"><input style={input} value={p.payment_frequency} onChange={(e) => field('payment_frequency', e.target.value)} /></Cell>
        {isElicos && <Cell label="Entrada (sem)"><Num value={p.deposit_weeks} onChange={(v) => field('deposit_weeks', v)} /></Cell>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          disabled={pending || !dirty}
          onClick={() => onRun(() => updatePreset(preset.id, {
            provider: p.provider, name: p.name, rate_per_week: p.rate_per_week, tuition: p.tuition,
            enrolment_fee: p.enrolment_fee, material_fee: p.material_fee, scholarship: p.scholarship,
            payment_parts: p.payment_parts, payment_frequency: p.payment_frequency, deposit_weeks: p.deposit_weeks,
            has_material: p.has_material, timetable: p.timetable,
          }), 'Preset atualizado.')}
          style={{ ...btn, background: dirty ? color.purpleDeep : '#fff', color: dirty ? '#fff' : ink(0.4), border: dirty ? 'none' : `1px solid ${color.line}`, cursor: pending || !dirty ? 'default' : 'pointer' }}
        >
          {dirty ? 'Salvar' : 'Salvo'}
        </button>
        <button type="button" disabled={pending} onClick={() => { if (confirm(`Remover ${preset.provider} — ${preset.name}?`)) onRun(() => deletePreset(preset.id), 'Preset removido.') }} style={{ ...btn, background: '#fff', color: '#D23B2B', border: '1px solid rgba(210,59,43,0.3)' }}>
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
      <button type="button" onClick={() => setOpen(true)} style={{ ...btn, marginTop: 12, background: '#fff', color: color.purple, border: `1px dashed ${color.line}` }}>
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
      <Cell label="Escola"><input required style={input} value={provider} onChange={(e) => setProvider(e.target.value)} /></Cell>
      <Cell label="Curso"><input required style={input} value={name} onChange={(e) => setName(e.target.value)} /></Cell>
      <Cell label={isElicos ? 'Valor/semana' : 'Tuition total'}><Num value={price} onChange={setPrice} /></Cell>
      <button type="submit" disabled={pending} style={{ ...btn, background: color.purpleDeep, color: '#fff', border: 'none' }}>Criar</button>
      <button type="button" onClick={() => setOpen(false)} style={{ ...btn, background: '#fff', color: ink(0.5), border: `1px solid ${color.line}` }}>Cancelar</button>
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

function Num({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      step="1"
      style={{ ...input, textAlign: 'right' }}
      value={value}
      onChange={(e) => {
        const n = Number.parseFloat(e.target.value)
        onChange(Number.isFinite(n) ? n : 0)
      }}
    />
  )
}

const input: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${color.line}`,
  background: '#fff', fontSize: 13, color: color.purpleDeep, fontFamily: font.ui, outline: 'none',
}
const btn: React.CSSProperties = {
  padding: '8px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, fontFamily: font.ui, cursor: 'pointer',
}
