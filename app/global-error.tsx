'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
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
    <html lang="pt-BR">
      <body style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Algo deu errado</h2>
        <p style={{ color: '#666', fontSize: '0.875rem' }}>{error.message ?? 'Erro inesperado'}</p>
        <button
          onClick={reset}
          style={{ padding: '0.5rem 1.25rem', background: '#4B1A77', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  )
}
