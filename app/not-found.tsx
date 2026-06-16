import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="pt">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: 32, maxWidth: 400 }}>
          <div style={{ fontSize: 64, fontWeight: 800, color: '#4B1A77', lineHeight: 1, marginBottom: 16 }}>404</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: '0 0 10px' }}>
            Página não encontrada
          </h2>
          <p style={{ fontSize: 14, color: '#666', margin: '0 0 22px', lineHeight: 1.55 }}>
            O endereço que você acessou não existe ou foi removido.
          </p>
          <Link
            href="/"
            style={{ display: 'inline-block', padding: '10px 24px', background: '#4B1A77', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
          >
            Voltar ao início
          </Link>
        </div>
      </body>
    </html>
  )
}
