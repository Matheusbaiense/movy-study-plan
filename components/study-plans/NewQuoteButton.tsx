'use client'

import { useFormStatus } from 'react-dom'

// Submit button with a pending state — the create server action + redirect can
// take a moment on a cold serverless start, so we show feedback instead of an
// apparently dead button.
export function NewQuoteButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        border: 0,
        borderRadius: 10,
        padding: '11px 16px',
        background: '#2A1153',
        color: '#fff',
        fontWeight: 700,
        cursor: pending ? 'wait' : 'pointer',
        opacity: pending ? 0.75 : 1,
        fontFamily: 'Outfit, sans-serif',
      }}
    >
      {pending ? 'Criando…' : '+ Nova cotação'}
    </button>
  )
}
