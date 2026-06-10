'use client'

import { useEffect } from 'react'

export default function ProtectedError({
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
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32, textAlign: 'center',
    }}>
      <div>
        <div style={{
          width: 52, height: 52, borderRadius: 16, background: 'rgba(231,44,3,0.1)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#E72C03" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          </svg>
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600, color: '#03182D' }}>
          Algo deu errado
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: 'rgba(3,24,45,0.6)', maxWidth: 360 }}>
          {error.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.'}
        </p>
        <button
          onClick={reset}
          style={{
            padding: '9px 18px', borderRadius: 10, background: '#03182D', color: '#fff',
            border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Sora, sans-serif',
          }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
