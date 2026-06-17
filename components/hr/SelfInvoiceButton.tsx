'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'
import { generateOwnInvoiceAction } from '@/app/[locale]/(protected)/hr/actions'
import { t, color } from '@/lib/ui/theme'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/form'

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

  function handleClose() {
    if (!isPending) setOpen(false)
  }

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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          width: '100%', padding: '9px 14px', borderRadius: 9,
          background: `${color.purple}12`, border: `1px solid ${color.purple}30`,
          color: t.accent, cursor: 'pointer', fontSize: 13, fontWeight: 600,
          justifyContent: 'center',
        }}
      >
        <FileText size={13} aria-hidden="true" />
        {pt ? 'Emitir minha Invoice' : 'Generate My Invoice'}
      </button>

      <Modal
        open={open}
        onClose={handleClose}
        title={pt ? 'Emitir minha Invoice' : 'Generate My Invoice'}
        width={420}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0, fontSize: 12, color: t.textMuted }}>
            {pt ? 'Somente entradas aprovadas serão incluídas.' : 'Only approved entries will be included.'}
          </p>

          {/* Period preset selector */}
          <div>
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
                    border: `1px solid ${preset === p ? color.purple : 'var(--border)'}`,
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label={pt ? 'Data Início' : 'Start Date'}>
                <Input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} />
              </Field>
              <Field label={pt ? 'Data Fim' : 'End Date'}>
                <Input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
              </Field>
            </div>
          )}

          {/* Preview of computed period */}
          {preset !== 'custom' && period.start && period.end && (
            <div style={{ padding: '8px 12px', background: `${color.purple}08`, border: `1px solid ${color.purple}20`, borderRadius: 8, fontSize: 12, color: t.textMuted }}>
              {period.start} → {period.end}
            </div>
          )}

          {error && (
            <div role="alert" style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={handleClose}>
              {pt ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button variant="primary" onClick={submit} loading={isPending}>
              {pt ? 'Gerar Invoice' : 'Generate Invoice'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
