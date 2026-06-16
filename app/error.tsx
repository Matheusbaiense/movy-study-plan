'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="pt">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: 32, maxWidth: 400 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: '0 0 10px' }}>
            Algo deu errado
          </h2>
          <p style={{ fontSize: 14, color: '#666', margin: '0 0 22px', lineHeight: 1.55 }}>
            {error.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.'}
          </p>
          <button
            onClick={reset}
            style={{ padding: '10px 24px', background: '#4B1A77', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
