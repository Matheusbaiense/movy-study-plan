'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setEmailLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      setError(
        locale === 'en'
          ? 'Invalid email or password.'
          : locale === 'es'
          ? 'Email o contraseña inválidos.'
          : 'Email ou senha inválidos.'
      )
      setEmailLoading(false)
      return
    }

    window.location.href = `/${locale}/home`
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
        <rect x="160" y="100" width="60" height="180" rx="6" fill="#4B1A77" />
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
            color: '#D23B2B',
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

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
          <span style={{ flex: 1, height: 1, background: 'rgba(249,249,249,0.15)' }} />
          <span style={{ fontSize: 12, color: 'rgba(249,249,249,0.4)', fontWeight: 600 }}>
            {locale === 'en' ? 'or' : locale === 'es' ? 'o' : 'ou'}
          </span>
          <span style={{ flex: 1, height: 1, background: 'rgba(249,249,249,0.15)' }} />
        </div>

        {/* Email + password form */}
        <form onSubmit={handlePasswordLogin} style={{ display: 'grid', gap: 10, textAlign: 'left' }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={locale === 'en' ? 'Email' : 'Email'}
            autoComplete="email"
            style={loginInputStyle}
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={locale === 'en' ? 'Password' : locale === 'es' ? 'Contraseña' : 'Senha'}
            autoComplete="current-password"
            style={loginInputStyle}
          />
          <button
            type="submit"
            disabled={emailLoading}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: 14,
              border: '1px solid rgba(249,249,249,0.25)',
              background: 'rgba(249,249,249,0.06)',
              color: '#F9F9F9',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'Outfit, system-ui, sans-serif',
              cursor: emailLoading ? 'wait' : 'pointer',
              opacity: emailLoading ? 0.7 : 1,
            }}
          >
            {emailLoading
              ? 'Autenticando…'
              : locale === 'en'
              ? 'Sign in'
              : locale === 'es'
              ? 'Entrar'
              : 'Entrar'}
          </button>
        </form>

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

const loginInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 14,
  border: '1px solid rgba(249,249,249,0.2)',
  background: 'rgba(249,249,249,0.04)',
  color: '#F9F9F9',
  fontSize: 15,
  fontFamily: 'Outfit, system-ui, sans-serif',
  outline: 'none',
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
    <svg width={size} height={size} viewBox="0 0 120 120" aria-label="Movy" style={{ overflow: 'visible' }}>
      <use href="#movySymColor" />
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
