import { sanitizeHtml } from '@/lib/security/sanitize-html'

interface WikiContentProps {
  html: string
}

export function WikiContent({ html }: WikiContentProps) {
  const safe = sanitizeHtml(html)

  if (!safe.trim()) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center text-slate-400 text-sm">
        Conteúdo ainda não disponível.
      </div>
    )
  }

  return (
    <article className="wiki-content" dangerouslySetInnerHTML={{ __html: safe }} />
  )
}
