'use client'

import { useState, useTransition } from 'react'
import { StudyPlanProposal } from './StudyPlanProposal'
import { acceptProposalAction } from '@/app/[locale]/p/[token]/actions'
import type { StudyPlanData } from '@/lib/study-plans/types'

const INK = '#2A1153'
const GOLD = '#FBB615'
const GREEN = '#16a34a'
const HAIR = 'rgba(28,18,51,0.10)'

interface Props {
  token: string
  data: StudyPlanData
  reference: string
  updatedAt: string | null
  acceptedAt: string | null
  studentName: string
}

export function PublicProposalPage({
  token,
  data,
  reference,
  updatedAt,
  acceptedAt: initialAcceptedAt,
  studentName,
}: Props) {
  const [accepted, setAccepted] = useState(!!initialAcceptedAt)
  const [signerName, setSignerName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleAccept() {
    setError('')
    startTransition(async () => {
      const result = await acceptProposalAction(token, signerName)
      if (result.ok) {
        setAccepted(true)
      } else {
        setError(result.error ?? 'Erro desconhecido')
      }
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ff' }}>
      <StudyPlanProposal
        data={data}
        reference={reference}
        updatedAt={updatedAt}
        backHref="#"
      />

      {accepted ? (
        <AcceptedBanner />
      ) : (
        <AcceptBar
          signerName={signerName}
          onSignerNameChange={setSignerName}
          agreed={agreed}
          onAgreedChange={setAgreed}
          onAccept={handleAccept}
          isPending={isPending}
          error={error}
        />
      )}
    </div>
  )
}

function AcceptedBanner() {
  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        background: GREEN,
        color: '#fff',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        fontWeight: 600,
        fontSize: 16,
        boxShadow: '0 -2px 20px rgba(0,0,0,0.15)',
      }}
    >
      <span style={{ fontSize: 22 }}>✓</span>
      Proposta aceita — obrigado! Em breve entraremos em contato.
    </div>
  )
}

interface AcceptBarProps {
  signerName: string
  onSignerNameChange: (v: string) => void
  agreed: boolean
  onAgreedChange: (v: boolean) => void
  onAccept: () => void
  isPending: boolean
  error: string
}

function AcceptBar({
  signerName,
  onSignerNameChange,
  agreed,
  onAgreedChange,
  onAccept,
  isPending,
  error,
}: AcceptBarProps) {
  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        background: '#fff',
        borderTop: `2px solid ${HAIR}`,
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 -4px 24px rgba(28,18,51,0.10)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div style={{ flex: '1 1 220px' }}>
          <label
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 600,
              color: INK,
              opacity: 0.6,
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Seu nome completo
          </label>
          <input
            type="text"
            value={signerName}
            onChange={(e) => onSignerNameChange(e.target.value)}
            placeholder="Nome completo do estudante"
            disabled={isPending}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: `1.5px solid ${HAIR}`,
              borderRadius: 8,
              fontSize: 14,
              color: INK,
              outline: 'none',
              background: '#fafafa',
            }}
          />
        </div>

        <button
          onClick={onAccept}
          disabled={isPending || !agreed || signerName.trim().length < 3}
          style={{
            flexShrink: 0,
            alignSelf: 'flex-end',
            padding: '12px 28px',
            background:
              isPending || !agreed || signerName.trim().length < 3
                ? '#e5e7eb'
                : GOLD,
            color:
              isPending || !agreed || signerName.trim().length < 3
                ? '#9ca3af'
                : INK,
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            cursor:
              isPending || !agreed || signerName.trim().length < 3
                ? 'not-allowed'
                : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {isPending ? 'Processando…' : 'Aceitar Proposta'}
        </button>
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          cursor: 'pointer',
          fontSize: 13,
          color: INK,
          opacity: 0.75,
        }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreedChange(e.target.checked)}
          disabled={isPending}
          style={{ marginTop: 2, accentColor: GOLD }}
        />
        <span>
          Li e concordo com os termos e condições desta proposta de estudo. Ao
          aceitar, autorizo a agência a prosseguir com as etapas de matrícula em
          meu nome.
        </span>
      </label>

      {error && (
        <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>{error}</p>
      )}
    </div>
  )
}
