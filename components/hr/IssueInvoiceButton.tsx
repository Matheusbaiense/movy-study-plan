'use client'

import { useState, useTransition } from 'react'
import { issueInvoiceAction } from '@/app/[locale]/(protected)/hr/actions'

interface IssueInvoiceButtonProps {
  invoiceId: string
  locale: string
}

export function IssueInvoiceButton({ invoiceId, locale }: IssueInvoiceButtonProps) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleIssue() {
    setError(null)
    startTransition(async () => {
      try {
        await issueInvoiceAction(invoiceId)
        setDone(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  if (done) {
    return (
      <span style={{ fontSize: 11, fontWeight: 600, color: '#166534' }}>
        ✓ {locale === 'pt' ? 'Emitida' : 'Issued'}
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <button
        onClick={handleIssue}
        disabled={isPending}
        style={{
          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
          background: isPending ? '#e5e7eb' : '#4B1A77', color: isPending ? '#6b7280' : '#fff',
          border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
        }}
      >
        {isPending ? '...' : (locale === 'pt' ? 'Emitir →' : 'Issue →')}
      </button>
      {error && <span style={{ fontSize: 10, color: '#dc2626' }}>{error}</span>}
    </div>
  )
}
