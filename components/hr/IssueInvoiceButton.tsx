'use client'

import { useState, useTransition } from 'react'
import { issueInvoiceAction } from '@/app/[locale]/(protected)/hr/actions'
import { Button } from '@/components/ui/Button'

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
      <Button
        variant="primary"
        onClick={handleIssue}
        loading={isPending}
        style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}
      >
        {locale === 'pt' ? 'Emitir →' : 'Issue →'}
      </Button>
      {error && <span style={{ fontSize: 10, color: '#dc2626' }}>{error}</span>}
    </div>
  )
}
