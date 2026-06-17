'use client'

import { useState, useTransition } from 'react'
import { getShareUrlAction } from '@/app/[locale]/(protected)/study-plans/actions'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

const INK = '#2A1153'
const HAIR = 'rgba(28,18,51,0.10)'

interface Props {
  planId: string
}

export function ShareProposalButton({ planId }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleOpen() {
    setOpen(true)
    if (!url) {
      startTransition(async () => {
        const result = await getShareUrlAction(planId)
        setUrl(result.url)
      })
    }
  }

  async function handleCopy() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button
        onClick={handleOpen}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'var(--accent)',
          color: INK,
          border: 'none',
          borderRadius: 40,
          padding: '12px 22px',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(251,182,21,0.40)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 50,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Compartilhar
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Link público da proposta" width={500}>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: INK, opacity: 0.6 }}>
          Qualquer pessoa com este link pode visualizar e aceitar a proposta. O link não expira automaticamente.
        </p>

        {/* C-H3 / C-M3: Skeleton while pending, URL display + copy once loaded */}
        {isPending ? (
          <Skeleton width="100%" height={40} />
        ) : url ? (
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '10px 12px',
              background: '#f5f3ff',
              borderRadius: 8,
              border: `1.5px solid ${HAIR}`,
              alignItems: 'center',
            }}
          >
            <span
              style={{
                flex: 1,
                fontSize: 12,
                color: INK,
                wordBreak: 'break-all',
                fontFamily: 'monospace',
              }}
            >
              {url}
            </span>
            {/* C-H3: copy button with 2s "Copiado!" feedback */}
            <Button variant="primary" onClick={handleCopy} style={{ flexShrink: 0 }}>
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </div>
      </Modal>
    </>
  )
}
