export const STATUS_STYLES = {
  published: { bg: 'rgba(75,26,119,0.12)', fg: '#4B1A77', dot: '#4B1A77' },
  draft:     { bg: 'rgba(243,107,28,0.14)', fg: '#B95F00', dot: '#F36B1C' },
  archived:  { bg: 'rgba(28,18,51,0.08)',   fg: '#2A1153', dot: '#2A1153' },
} as const

export function getStatusLabel(status: string, locale: string): string {
  if (status === 'published') return locale === 'pt' ? 'Publicado' : locale === 'es' ? 'Publicado' : 'Published'
  if (status === 'draft')     return locale === 'pt' ? 'Rascunho'  : locale === 'es' ? 'Borrador'  : 'Draft'
  if (status === 'archived')  return locale === 'pt' ? 'Arquivado' : locale === 'es' ? 'Archivado' : 'Archived'
  return status
}
