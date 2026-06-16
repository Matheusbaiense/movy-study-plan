'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
      <div style={{ maxWidth: 400 }}>
        <div style={{
          width: 54, height: 54, borderRadius: 16, background: 'rgba(243,107,28,0.1)', border: '1px solid rgba(243,107,28,0.2)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
        }}>
          <AlertTriangle size={22} strokeWidth={1.6} color="#F36B1C" aria-hidden />
        </div>
        <div className="movy-kicker" style={{ marginBottom: 10 }}>Erro</div>
        <h2 className="typography-title-700" style={{ margin: '0 0 10px' }}>
          Algo deu errado
        </h2>
        <p className="color-fg-soft" style={{ margin: '0 0 22px', fontSize: 14, lineHeight: 1.55 }}>
          {error.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.'}
        </p>
        <button onClick={reset} className="button-fill-primary-md" style={{ margin: '0 auto' }}>
          <RotateCcw size={16} strokeWidth={2.4} aria-hidden />
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
