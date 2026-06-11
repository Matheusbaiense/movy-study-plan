import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'radial-gradient(900px 500px at 12% 18%, rgba(243,107,28,0.16), transparent 60%), radial-gradient(900px 600px at 88% 90%, rgba(75,26,119,0.4), transparent 60%), #190A38',
      fontFamily: 'Outfit, system-ui, sans-serif',
      color: '#F9F9F9',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 34 }}>
          <svg width={48} height={48} viewBox="0 0 120 120" aria-label="Movy" style={{ overflow: 'visible' }}>
            <use href="#movySymColor" />
          </svg>
        </div>

        <div style={{
          width: 60, height: 60, borderRadius: 16,
          background: 'rgba(243,107,28,0.14)', border: '1px solid rgba(243,107,28,0.3)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22,
        }}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#FBB615" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </div>

        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#FBB615', marginBottom: 12 }}>
          Acesso restrito
        </div>
        <h1 style={{ margin: '0 0 12px', fontFamily: 'Outfit, sans-serif', fontSize: 38, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.96 }}>
          Acesso negado
        </h1>
        <p style={{ margin: '0 0 28px', fontSize: 15, color: 'rgba(249,249,249,0.62)', lineHeight: 1.6 }}>
          Sua conta não tem acesso ao Movy Internal Hub. Fale com um administrador para solicitar acesso.
        </p>

        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 12,
            background: '#F9F9F9', color: '#2A1153',
            fontSize: 14, fontWeight: 700, textDecoration: 'none', fontFamily: 'Outfit, sans-serif',
          }}
        >
          Voltar ao login
        </Link>

        <div style={{ marginTop: 34, fontFamily: '"Space Mono", monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(249,249,249,0.3)' }}>
          Movy Education · Internal Hub
        </div>
      </div>
    </main>
  )
}
