import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="pt-BR">
      <body style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Página não encontrada</h2>
        <p style={{ color: '#666', fontSize: '0.875rem' }}>O endereço acessado não existe.</p>
        <Link
          href="/"
          style={{ padding: '0.5rem 1.25rem', background: '#4B1A77', color: '#fff', borderRadius: '0.375rem', textDecoration: 'none' }}
        >
          Voltar ao início
        </Link>
      </body>
    </html>
  )
}
