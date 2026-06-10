import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'radial-gradient(900px 500px at 12% 18%, rgba(231,44,3,0.18), transparent 60%), radial-gradient(900px 600px at 88% 90%, rgba(5,117,112,0.22), transparent 60%), #03182D',
      fontFamily: 'Sora, system-ui, sans-serif',
      color: '#F9F9F9',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        {/* MovyMark */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <svg width={40} height={40} viewBox="0 0 64 64" fill="none" aria-label="Movy">
            <path d="M22 8 C24 8, 26 9, 26 13 L20 50 C19 56, 16 58, 13 58 C10 58, 8 56, 9 51 L17 13 C18 10, 20 8, 22 8 Z" fill="#E72C03" />
            <path d="M34 14 C36 14, 38 15, 38 19 L32 51 C31 56, 28 58, 25 58 C22 58, 20 56, 21 52 L29 19 C30 16, 32 14, 34 14 Z" fill="#FF8B00" />
            <path d="M46 20 C48 20, 50 21, 50 25 L44 52 C43 56, 40 58, 37 58 C34 58, 32 56, 33 53 L41 25 C42 22, 44 20, 46 20 Z" fill="#057570" />
          </svg>
        </div>

        {/* Icon */}
        <div style={{
          width: 60, height: 60, borderRadius: 18,
          background: 'rgba(231,44,3,0.15)',
          border: '1px solid rgba(231,44,3,0.25)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#E72C03" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </div>

        <h1 style={{ margin: '0 0 10px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Acesso Negado
        </h1>
        <p style={{ margin: '0 0 28px', fontSize: 15, color: 'rgba(249,249,249,0.6)', lineHeight: 1.6 }}>
          Sua conta n&atilde;o tem acesso ao Movy Internal Hub.
          Entre em contato com o administrador para solicitar acesso.
        </p>

        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 12,
            background: '#F9F9F9', color: '#03182D',
            fontSize: 14, fontWeight: 600, textDecoration: 'none',
            fontFamily: 'Sora, sans-serif',
          }}
        >
          Voltar ao Login
        </Link>

        <div style={{ marginTop: 32, fontSize: 12, color: 'rgba(249,249,249,0.3)' }}>
          Powered by Movy Technology
        </div>
      </div>
    </main>
  )
}
