'use client'

import { useState, useTransition } from 'react'
import { StudyPlanProposal } from './StudyPlanProposal'
import { Field, Input } from '@/components/ui/form'
import { Button } from '@/components/ui/Button'
import { acceptProposalAction } from '@/app/[locale]/p/[token]/actions'
import type { StudyPlanData } from '@/lib/study-plans/types'

const INK = '#2A1153'
const PURPLE = '#4B1A77'
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
      {!accepted && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            background: PURPLE,
            color: '#fff',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 2px 12px rgba(75,26,119,0.25)',
          }}
        >
          <span>Esta proposta aguarda sua aceitação.</span>
          <a
            href="#accept"
            style={{
              color: GOLD,
              fontWeight: 700,
              textDecoration: 'underline',
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
          >
            Aceitar agora ↓
          </a>
        </div>
      )}

      <StudyPlanProposal
        data={data}
        reference={reference}
        updatedAt={updatedAt}
        backHref="#"
        isPublic
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
  const canSubmit = !isPending && agreed && signerName.trim().length >= 3
  return (
    <div
      id="accept"
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
          alignItems: 'flex-end',
        }}
      >
        {/* C-H1: proper Field+Input association */}
        <div style={{ flex: '1 1 220px' }}>
          <Field label="Seu nome completo">
            <Input
              type="text"
              value={signerName}
              onChange={(e) => onSignerNameChange(e.target.value)}
              placeholder="Nome completo do estudante"
              disabled={isPending}
            />
          </Field>
        </div>

        <Button
          variant="primary"
          onClick={onAccept}
          disabled={!canSubmit}
          loading={isPending}
          style={{ flexShrink: 0, alignSelf: 'flex-end' }}
        >
          {isPending ? 'Processando…' : 'Aceitar Proposta'}
        </Button>
      </div>

      {/* C-H7: checkbox tap target ≥44px, visible focus ring */}
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
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 24,
            minHeight: 24,
            padding: 10,
            margin: -10,
          }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => onAgreedChange(e.target.checked)}
            disabled={isPending}
            aria-label="Concordo com os termos e condições"
            style={{
              width: 20,
              height: 20,
              accentColor: GOLD,
              cursor: 'pointer',
              outline: 'revert',
            }}
          />
        </span>
        <span style={{ paddingTop: 2 }}>
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
