'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const locale = (params?.locale as string) ?? 'pt'

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?locale=${locale}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (authError) {
      setError('Falha ao iniciar login. Por favor tente novamente.')
      setLoading(false)
    }
  }

  const continueText = locale === 'pt' ? 'Continuar com Google' : locale === 'es' ? 'Continuar con Google' : 'Continue with Google'
  const restrictedText = locale === 'pt'
    ? 'Apenas usuários autorizados pela Movy podem acessar.'
    : locale === 'es'
    ? 'Solo usuarios autorizados por Movy pueden acceder.'
    : 'Only users authorised by Movy can access.'

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(900px 500px at 12% 18%, rgba(251,182,21,0.16), transparent 60%), radial-gradient(900px 600px at 88% 90%, rgba(75,26,119,0.32), transparent 60%), radial-gradient(700px 500px at 60% 10%, rgba(243,107,28,0.12), transparent 60%), #190A38',
        color: '#F9F9F9',
        fontFamily: 'Outfit, system-ui, sans-serif',
      }}
    >
      {/* Staircase motif */}
      <svg
        style={{ position: 'absolute', left: -40, bottom: -40, opacity: 0.07 }}
        width="380" height="380" viewBox="0 0 320 320" fill="none" aria-hidden
      >
        <rect x="40" y="220" width="60" height="60" rx="6" fill="#FBB615" />
        <rect x="100" y="160" width="60" height="120" rx="6" fill="#F36B1C" />
        <rect x="160" y="100" width="60" height="180" rx="6" fill="#7A1E7E" />
        <rect x="220" y="40" width="60" height="240" rx="6" fill="#F9F9F9" />
      </svg>

      <div style={{ position: 'relative', width: '100%', maxWidth: 440, textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <MovyWordmark size={48} />
        </div>

        {/* Headline */}
        <h1 style={{ margin: '0 0 56px', fontSize: 38, lineHeight: 1.08, fontWeight: 800, letterSpacing: '-0.03em' }}>
          We <span style={{ color: '#FBB615' }}>move</span> people.
        </h1>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 16,
            padding: '12px 16px',
            borderRadius: 12,
            background: 'rgba(210,59,43,0.15)',
            border: '1px solid rgba(210,59,43,0.3)',
            fontSize: 14,
            color: '#fca5a5',
          }}>
            {error}
          </div>
        )}

        {/* Google button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '15px 18px',
            borderRadius: 14,
            border: 'none',
            background: '#F9F9F9',
            color: '#2A1153',
            fontSize: 15,
            fontWeight: 600,
            fontFamily: 'Outfit, system-ui, sans-serif',
            cursor: loading ? 'wait' : 'pointer',
            boxShadow: '0 16px 50px rgba(0,0,0,0.3)',
            transition: 'transform .15s ease',
            opacity: loading ? 0.8 : 1,
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span
                className="movy-spin"
                style={{
                  width: 16, height: 16,
                  border: '2px solid rgba(28,18,51,0.2)',
                  borderTopColor: '#2A1153',
                  borderRadius: 999,
                  display: 'inline-block',
                }}
              />
              Autenticando…
            </span>
          ) : (
            <>
              <GoogleIcon />
              {continueText}
            </>
          )}
        </button>

        {/* Domain note */}
        <div style={{
          marginTop: 22,
          fontSize: 12.5,
          color: 'rgba(249,249,249,0.55)',
          lineHeight: 1.6,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <LockIcon />
          <span>{restrictedText}</span>
        </div>
      </div>
    </main>
  )
}

function MovyWordmark({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <MovyMark size={size} />
      <span style={{
        fontFamily: 'Outfit, system-ui, sans-serif',
        fontWeight: 800,
        fontSize: Math.round(size * 0.62),
        letterSpacing: '-0.02em',
        color: '#F9F9F9',
      }}>Movy</span>
      <span style={{
        fontFamily: 'Outfit, system-ui, sans-serif',
        fontWeight: 400,
        fontSize: 13,
        color: 'rgba(249,249,249,0.55)',
        letterSpacing: '0.02em',
      }}>Internal Hub</span>
    </div>
  )
}

function MovyMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Movy">
      <path d="M22 8 C24 8, 26 9, 26 13 L20 50 C19 56, 16 58, 13 58 C10 58, 8 56, 9 51 L17 13 C18 10, 20 8, 22 8 Z" fill="#FBB615" />
      <path d="M34 14 C36 14, 38 15, 38 19 L32 51 C31 56, 28 58, 25 58 C22 58, 20 56, 21 52 L29 19 C30 16, 32 14, 34 14 Z" fill="#F36B1C" />
      <path d="M46 20 C48 20, 50 21, 50 25 L44 52 C43 56, 40 58, 37 58 C34 58, 32 56, 33 53 L41 25 C42 22, 44 20, 46 20 Z" fill="#7A1E7E" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24">
      <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853" />
      <path d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9l3.3-2.5z" fill="#FBBC05" />
      <path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3 14.7 2 12 2A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.7 9.4 6 12 6z" fill="#EA4335" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="rgba(249,249,249,0.5)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}
