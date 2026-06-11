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
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
      <div style={{ maxWidth: 400 }}>
        <div style={{
          width: 54, height: 54, borderRadius: 16, background: 'rgba(243,107,28,0.1)', border: '1px solid rgba(243,107,28,0.2)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
        }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#F36B1C" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>
        <div className="movy-kicker" style={{ marginBottom: 10 }}>Erro</div>
        <h2 style={{ margin: '0 0 10px', fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: '-0.035em', color: '#2A1153' }}>
          Algo deu errado
        </h2>
        <p style={{ margin: '0 0 22px', fontSize: 14, color: 'rgba(28,18,51,0.6)', lineHeight: 1.55 }}>
          {error.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.'}
        </p>
        <button
          onClick={reset}
          style={{ padding: '11px 20px', borderRadius: 10, background: '#F36B1C', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
