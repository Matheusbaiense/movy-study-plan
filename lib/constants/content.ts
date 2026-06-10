export const STATUS_STYLES = {
  published: { bg: 'rgba(5,117,112,0.12)', fg: '#057570', dot: '#057570' },
  draft:     { bg: 'rgba(255,139,0,0.14)', fg: '#B95F00', dot: '#FF8B00' },
  archived:  { bg: 'rgba(3,24,45,0.08)',   fg: '#03182D', dot: '#03182D' },
} as const

export function getStatusLabel(status: string, locale: string): string {
  if (status === 'published') return locale === 'pt' ? 'Publicado' : locale === 'es' ? 'Publicado' : 'Published'
  if (status === 'draft')     return locale === 'pt' ? 'Rascunho'  : locale === 'es' ? 'Borrador'  : 'Draft'
  if (status === 'archived')  return locale === 'pt' ? 'Arquivado' : locale === 'es' ? 'Archivado' : 'Archived'
  return status
}
