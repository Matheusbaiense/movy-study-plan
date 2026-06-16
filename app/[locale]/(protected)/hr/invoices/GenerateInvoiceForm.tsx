'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle } from 'lucide-react'
import type { EmployeeProfile } from '@/lib/hr/types'
import { generateInvoiceAction } from '../actions'
import { t, ink } from '@/lib/ui/theme'

type EmployeeWithName = EmployeeProfile & { full_name: string; email: string }

interface Props {
  employees: EmployeeWithName[]
  locale: string
  orgId: string
}

type PeriodPreset = 'weekly' | 'fortnightly' | 'monthly' | 'custom'

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function computePeriod(preset: PeriodPreset): { start: string; end: string } {
  const today = new Date()
  const dow = today.getDay() // 0=Sun, 1=Mon...

  if (preset === 'weekly') {
    // previous complete Mon–Sun
    const lastSun = new Date(today)
    lastSun.setDate(today.getDate() - dow)
    lastSun.setHours(0, 0, 0, 0)
    const lastMon = new Date(lastSun)
    lastMon.setDate(lastSun.getDate() - 6)
    return { start: isoDate(lastMon), end: isoDate(lastSun) }
  }

  if (preset === 'fortnightly') {
    // last 2 complete weeks (Mon–Sun)
    const lastSun = new Date(today)
    lastSun.setDate(today.getDate() - dow)
    lastSun.setHours(0, 0, 0, 0)
    const fortMon = new Date(lastSun)
    fortMon.setDate(lastSun.getDate() - 13)
    return { start: isoDate(fortMon), end: isoDate(lastSun) }
  }

  if (preset === 'monthly') {
    // previous complete calendar month
    const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastOfPrevMonth = new Date(firstOfThisMonth)
    lastOfPrevMonth.setDate(0)
    const firstOfPrevMonth = new Date(lastOfPrevMonth.getFullYear(), lastOfPrevMonth.getMonth(), 1)
    return { start: isoDate(firstOfPrevMonth), end: isoDate(lastOfPrevMonth) }
  }

  return { start: '', end: '' }
}

const PRESETS: { id: PeriodPreset; pt: string; en: string }[] = [
  { id: 'weekly',      pt: 'Semanal',      en: 'Weekly' },
  { id: 'fortnightly', pt: 'Quinzenal',    en: 'Fortnightly' },
  { id: 'monthly',     pt: 'Mensal',       en: 'Monthly' },
  { id: 'custom',      pt: 'Personalizado', en: 'Custom' },
]

function displayName(emp: EmployeeWithName): string {
  if (emp.full_name?.trim()) return emp.full_name.trim()
  if (emp.email) return emp.email
  return emp.id.slice(0, 8) + '…'
}

export function GenerateInvoiceForm({ employees, locale, orgId: _orgId }: Props) {
  const [open, setOpen] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [preset, setPreset] = useState<PeriodPreset>('fortnightly')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pt = locale === 'pt'

  function getPeriod() {
    if (preset === 'custom') return { start: customStart, end: customEnd }
    return computePeriod(preset)
  }

  function handleOpen() {
    setEmployeeId('')
    setPreset('fortnightly')
    setCustomStart('')
    setCustomEnd('')
    setError(null)
    setOpen(true)
  }

  function handleSubmit() {
    const { start, end } = getPeriod()
    if (!employeeId) { setError(pt ? 'Selecione um funcionário' : 'Select an employee'); return }
    if (!start || !end) { setError(pt ? 'Defina o período' : 'Define the period'); return }
    if (start > end) { setError(pt ? 'Data inicial deve ser anterior à final' : 'Start must be before end'); return }
    setError(null)
    startTransition(async () => {
      try {
        const invoice = await generateInvoiceAction(employeeId, start, end)
        setOpen(false)
        router.push(`/${locale}/hr/invoices/${invoice.id}/print`)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error generating invoice')
      }
    })
  }

  const { start: previewStart, end: previewEnd } = preset !== 'custom' ? computePeriod(preset) : { start: customStart, end: customEnd }

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
    textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 8,
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: `1px solid ${ink(0.15)}`, background: 'var(--surface)',
    color: t.text, fontSize: 14, boxSizing: 'border-box',
  }

  return (
    <>
      <button
        onClick={handleOpen}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#4B1A77', color: '#fff',
          border: 'none', borderRadius: 8, padding: '10px 18px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        <PlusCircle size={16} />
        {pt ? 'Gerar Invoice' : 'Generate Invoice'}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)', borderRadius: 16, padding: 32,
              width: 460, boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
              display: 'flex', flexDirection: 'column', gap: 20,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: 0 }}>
              {pt ? 'Gerar Tax Invoice' : 'Generate Tax Invoice'}
            </h2>

            {/* Employee */}
            <div>
              <label htmlFor="emp-select" style={labelStyle}>
                {pt ? 'Funcionário' : 'Employee'}
              </label>
              <select
                id="emp-select"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                style={inputStyle}
              >
                <option value="">{pt ? 'Selecionar…' : 'Select…'}</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {displayName(emp)} — AU${(emp.hourly_rate_in_cents / 100).toFixed(2)}/hr
                  </option>
                ))}
              </select>
            </div>

            {/* Period preset */}
            <div>
              <span style={labelStyle}>{pt ? 'Período' : 'Period'}</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {PRESETS.map((p) => {
                  const active = preset === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPreset(p.id)}
                      style={{
                        padding: '8px 6px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        border: `1.5px solid ${active ? '#7C3AED' : ink(0.15)}`,
                        background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                        color: active ? '#7C3AED' : t.textMuted,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {pt ? p.pt : p.en}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom date pickers */}
            {preset === 'custom' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="period-start" style={labelStyle}>{pt ? 'De' : 'From'}</label>
                  <input id="period-start" type="date" value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="period-end" style={labelStyle}>{pt ? 'Até' : 'To'}</label>
                  <input id="period-end" type="date" value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)} style={inputStyle} />
                </div>
              </div>
            ) : (
              /* Preview of computed dates */
              previewStart && (
                <div style={{
                  background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
                  borderRadius: 8, padding: '10px 14px',
                  fontSize: 13, color: t.text,
                }}>
                  <span style={{ color: t.textMuted, fontSize: 11, fontWeight: 600, marginRight: 8 }}>
                    {pt ? 'PERÍODO' : 'PERIOD'}
                  </span>
                  {new Date(previewStart + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  {' → '}
                  {new Date(previewEnd + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              )
            )}

            {error && (
              <div role="alert" style={{ fontSize: 12, color: '#dc2626', background: 'rgba(220,38,38,0.06)', padding: '8px 12px', borderRadius: 6 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOpen(false)}
                style={{ padding: '9px 18px', borderRadius: 8, border: `1px solid ${ink(0.15)}`, background: 'none', color: t.text, cursor: 'pointer', fontSize: 14 }}
              >
                {pt ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                style={{ padding: '9px 22px', borderRadius: 8, background: '#4B1A77', color: '#fff', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, opacity: isPending ? 0.7 : 1 }}
              >
                {isPending ? (pt ? 'Gerando…' : 'Generating…') : (pt ? 'Gerar' : 'Generate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
