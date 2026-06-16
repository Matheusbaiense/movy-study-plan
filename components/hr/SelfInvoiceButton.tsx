'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, X } from 'lucide-react'
import { generateOwnInvoiceAction } from '@/app/[locale]/(protected)/hr/actions'
import { t, ink, color, font } from '@/lib/ui/theme'

type Preset = 'weekly' | 'fortnightly' | 'monthly' | 'custom'

function computePeriod(preset: Preset): { start: string; end: string } {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  if (preset === 'weekly') {
    const end = new Date(now)
    end.setDate(now.getDate() - now.getDay() - 1) // last Sunday
    const start = new Date(end)
    start.setDate(end.getDate() - 6) // prev Monday
    return { start: iso(start), end: iso(end) }
  }
  if (preset === 'fortnightly') {
    const end = new Date(now)
    end.setDate(now.getDate() - 1)
    const start = new Date(end)
    start.setDate(end.getDate() - 13)
    return { start: iso(start), end: iso(end) }
  }
  if (preset === 'monthly') {
    const y = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    const m = now.getMonth() === 0 ? 12 : now.getMonth()
    const lastDay = new Date(y, m, 0).getDate()
    return { start: `${y}-${pad(m)}-01`, end: `${y}-${pad(m)}-${pad(lastDay)}` }
  }
  // custom — return empty (user fills in)
  return { start: '', end: '' }
}

interface SelfInvoiceButtonProps {
  locale: string
}

export function SelfInvoiceButton({ locale }: SelfInvoiceButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [preset, setPreset] = useState<Preset>('monthly')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const pt = locale === 'pt'

  const period = preset === 'custom'
    ? { start: customStart, end: customEnd }
    : computePeriod(preset)

  function submit() {
    setError(null)
    if (!period.start || !period.end) {
      setError(pt ? 'Selecione o período.' : 'Please select a period.')
      return
    }
    startTransition(async () => {
      try {
        const invoice = await generateOwnInvoiceAction(period.start, period.end)
        router.push(`/${locale}/hr/invoices/${invoice.id}/print`)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao gerar invoice.')
      }
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', borderRadius: 8,
    border: `1px solid ${ink(0.14)}`, background: 'var(--bg)',
    color: t.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          width: '100%', padding: '9px 14px', borderRadius: 9,
          background: `${color.purple}12`, border: `1px solid ${color.purple}30`,
          color: color.purple, cursor: 'pointer', fontSize: 13, fontWeight: 600,
          justifyContent: 'center',
        }}
      >
        <FileText size={13} />
        {pt ? 'Emitir minha Invoice' : 'Generate My Invoice'}
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div style={{
            background: 'var(--surface)', borderRadius: 18, padding: 28,
            width: 420, maxWidth: '90vw',
            boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
            border: `1px solid ${ink(0.1)}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: t.text, margin: 0 }}>
                  {pt ? 'Emitir minha Invoice' : 'Generate My Invoice'}
                </h2>
                <p style={{ fontSize: 12, color: t.textMuted, margin: '3px 0 0' }}>
                  {pt ? 'Somente entradas aprovadas serão incluídas.' : 'Only approved entries will be included.'}
                </p>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, padding: 6, lineHeight: 0 }}>
                <X size={16} />
              </button>
            </div>

            {/* Period preset selector */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                {pt ? 'Período' : 'Period'}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['weekly', 'fortnightly', 'monthly', 'custom'] as Preset[]).map((p) => {
                  const labels: Record<Preset, string> = {
                    weekly: pt ? 'Semanal' : 'Weekly',
                    fortnightly: pt ? 'Quinzenal' : 'Fortnightly',
                    monthly: pt ? 'Mensal' : 'Monthly',
                    custom: pt ? 'Personalizado' : 'Custom',
                  }
                  return (
                    <button key={p} onClick={() => setPreset(p)} style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: preset === p ? color.purple : 'var(--bg)',
                      color: preset === p ? '#fff' : t.textMuted,
                      border: `1px solid ${preset === p ? color.purple : ink(0.14)}`,
                      cursor: 'pointer',
                    }}>
                      {labels[p]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom date inputs */}
            {preset === 'custom' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
                    {pt ? 'Data Início' : 'Start Date'}
                  </div>
                  <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
                    {pt ? 'Data Fim' : 'End Date'}
                  </div>
                  <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={inputStyle} />
                </div>
              </div>
            )}

            {/* Preview of computed period */}
            {preset !== 'custom' && period.start && period.end && (
              <div style={{ marginBottom: 14, padding: '8px 12px', background: `${color.purple}08`, border: `1px solid ${color.purple}20`, borderRadius: 8, fontSize: 12, color: t.textMuted }}>
                {period.start} → {period.end}
              </div>
            )}

            {error && (
              <div style={{ marginBottom: 14, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOpen(false)}
                style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${ink(0.14)}`, background: 'none', color: t.text, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
              >
                {pt ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={submit}
                disabled={isPending}
                style={{
                  padding: '9px 22px', borderRadius: 9, border: 'none',
                  background: color.purple, color: '#fff',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 600, opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending ? '...' : (pt ? 'Gerar Invoice' : 'Generate Invoice')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
