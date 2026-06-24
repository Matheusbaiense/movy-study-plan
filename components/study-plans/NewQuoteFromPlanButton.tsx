'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { duplicateStudyPlan } from '@/app/[locale]/(protected)/study-plans/actions'

interface Props {
  planId: string
  locale: string
  /** 'solid' for the proposal/PDF page (primary CTA), 'outline' for the editor header. */
  variant?: 'solid' | 'outline'
}

// Surfaces "Nova cotação" from inside an existing student's quote. Reuses the
// `duplicateStudyPlan` action (carries the student + courses into a fresh draft)
// and navigates to the new editor — so a user looking at an existing quote can
// start another one without detouring back to the list.
export function NewQuoteFromPlanButton({ planId, locale, variant = 'outline' }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(false)

  function handleClick() {
    setError(false)
    startTransition(async () => {
      try {
        const { id } = await duplicateStudyPlan(planId, locale)
        router.push(`/${locale}/study-plans/${id}`)
      } catch {
        setError(true)
      }
    })
  }

  const base: React.CSSProperties = {
    borderRadius: 10,
    padding: '10px 16px',
    fontWeight: 700,
    cursor: isPending ? 'wait' : 'pointer',
    fontFamily: 'Outfit, sans-serif',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    opacity: isPending ? 0.75 : 1,
  }
  const skin: React.CSSProperties =
    variant === 'solid'
      ? { ...base, border: 0, background: '#2A1153', color: '#fff' }
      : { ...base, border: '1px solid #2A1153', background: 'var(--surface)', color: 'var(--text)' }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      style={skin}
      aria-busy={isPending || undefined}
      title="Criar uma nova cotação a partir desta (mantém estudante e cursos)"
    >
      {isPending ? 'Criando…' : error ? 'Tentar de novo' : '+ Nova cotação'}
    </button>
  )
}
