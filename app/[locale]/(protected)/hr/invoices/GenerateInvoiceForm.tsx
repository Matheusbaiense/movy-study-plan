'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle } from 'lucide-react'
import type { EmployeeProfile } from '@/lib/hr/types'
import { generateInvoiceAction } from '../actions'
import { t, ink } from '@/lib/ui/theme'

interface Props {
  employees: EmployeeProfile[]
  locale: string
  orgId: string
}

export function GenerateInvoiceForm({ employees, locale }: Props) {
  const [open, setOpen] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit() {
    if (!employeeId || !periodStart || !periodEnd) {
      setError('All fields are required')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        const invoice = await generateInvoiceAction(employeeId, periodStart, periodEnd)
        setOpen(false)
        router.push(`/${locale}/hr/invoices/${invoice.id}/print`)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error generating invoice')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={locale === 'pt' ? 'Gerar Invoice' : 'Generate Invoice'}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#4B1A77', color: '#fff',
          border: 'none', borderRadius: 8, padding: '10px 18px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        <PlusCircle size={16} aria-hidden="true" />
        {locale === 'pt' ? 'Gerar Invoice' : 'Generate Invoice'}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={locale === 'pt' ? 'Gerar Tax Invoice' : 'Generate Tax Invoice'}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)', borderRadius: 16, padding: 32,
              width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 24px' }}>
              {locale === 'pt' ? 'Gerar Tax Invoice' : 'Generate Tax Invoice'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label htmlFor="employee-select" style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, display: 'block', marginBottom: 6 }}>
                  Employee
                </label>
                <select
                  id="employee-select"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${ink(0.15)}`, background: 'var(--surface)', color: t.text, fontSize: 14 }}
                >
                  <option value="">Select employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.id.slice(0, 8)}… (AU${(emp.hourly_rate_in_cents / 100).toFixed(2)}/hr)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="period-start" style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, display: 'block', marginBottom: 6 }}>
                    Period Start
                  </label>
                  <input
                    id="period-start"
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${ink(0.15)}`, background: 'var(--surface)', color: t.text, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label htmlFor="period-end" style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, display: 'block', marginBottom: 6 }}>
                    Period End
                  </label>
                  <input
                    id="period-end"
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${ink(0.15)}`, background: 'var(--surface)', color: t.text, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {error && <div role="alert" style={{ fontSize: 12, color: '#dc2626', marginTop: 12 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${ink(0.15)}`, background: 'none', color: t.text, cursor: 'pointer', fontSize: 14 }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={isPending} style={{ padding: '8px 20px', borderRadius: 8, background: '#4B1A77', color: '#fff', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600 }}>
                {isPending ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
