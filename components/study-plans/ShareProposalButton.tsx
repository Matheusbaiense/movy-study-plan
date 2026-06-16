'use client'

import { useState, useTransition } from 'react'
import { getShareUrlAction } from '@/app/[locale]/(protected)/study-plans/actions'

const INK = '#2A1153'
const GOLD = '#FBB615'
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
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <>
      <button
        onClick={handleOpen}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: GOLD,
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Compartilhar
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '28px 28px 24px',
              maxWidth: 500,
              width: '100%',
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            }}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: INK }}>
              Link público da proposta
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: INK, opacity: 0.6 }}>
              Qualquer pessoa com este link pode visualizar e aceitar a proposta. O link não expira automaticamente.
            </p>

            {isPending ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: INK, opacity: 0.5 }}>
                Gerando link…
              </div>
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
                <button
                  onClick={handleCopy}
                  style={{
                    flexShrink: 0,
                    background: copied ? '#16a34a' : GOLD,
                    color: copied ? '#fff' : INK,
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none',
                  border: `1.5px solid ${HAIR}`,
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontSize: 13,
                  color: INK,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
