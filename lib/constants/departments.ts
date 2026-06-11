export const DEPARTMENTS = [
  {
    slug: 'visao-geral',
    accent: '#4B1A77',
    pillar: 'Base',
    name_pt: 'Visão Geral',
    name_en: 'Overview',
    name_es: 'Visión General',
    desc_pt: 'Jornada do estudante, perfis de cliente e visão operacional da Movy.',
    desc_en: 'Student journey, client profiles and Movy operating overview.',
    desc_es: 'Jornada del estudiante, perfiles de cliente y visión operativa de Movy.',
  },
  {
    slug: 'captacao-vendas',
    accent: '#F36B1C',
    pillar: 'Comercial',
    name_pt: 'Captação & Vendas',
    name_en: 'Sales Intake',
    name_es: 'Captación & Ventas',
    desc_pt: 'Primeiro contato, qualificação, proposta, admissões e timeline comercial.',
    desc_en: 'First contact, qualification, proposal, admissions and commercial timeline.',
    desc_es: 'Primer contacto, calificación, propuesta, admisiones y timeline comercial.',
  },
  {
    slug: 'vistos',
    accent: '#FBB615',
    pillar: 'Operação',
    name_pt: 'Vistos',
    name_en: 'Visas',
    name_es: 'Visas',
    desc_pt: 'Subclass 500, documentação, GS, aplicação, formulários e compliance.',
    desc_en: 'Subclass 500, documents, GS, applications, forms and compliance.',
    desc_es: 'Subclass 500, documentación, GS, aplicación, formularios y compliance.',
  },
  {
    slug: 'student-support',
    accent: '#D23B2B',
    pillar: 'Suporte',
    name_pt: 'Student Support',
    name_en: 'Student Support',
    name_es: 'Student Support',
    desc_pt: 'Pré-embarque, chegada, welcome session e suporte contínuo ao estudante.',
    desc_en: 'Pre-departure, arrival, welcome session and ongoing student support.',
    desc_es: 'Pre-embarque, llegada, welcome session y soporte continuo al estudiante.',
  },
  {
    slug: 'processos-ferramentas',
    accent: '#3A1560',
    pillar: 'Operação',
    name_pt: 'Processos & Ferramentas',
    name_en: 'Processes & Tools',
    name_es: 'Procesos & Herramientas',
    desc_pt: 'Refund, cancelamento, change of course, Monday, OSHC, CommBank e USI.',
    desc_en: 'Refunds, cancellations, change of course, Monday, OSHC, CommBank and USI.',
    desc_es: 'Refunds, cancelaciones, cambio de curso, Monday, OSHC, CommBank y USI.',
  },
  {
    slug: 'nomenclaturas',
    accent: '#5A4E72',
    pillar: 'Drive',
    name_pt: 'Nomenclaturas',
    name_en: 'Naming Rules',
    name_es: 'Nomenclaturas',
    desc_pt: 'Padrões de nomenclatura e organização de documentos no Drive.',
    desc_en: 'Naming standards and document organization in Drive.',
    desc_es: 'Padrones de nomenclatura y organización de documentos en Drive.',
  },
  {
    slug: 'politicas-internas',
    accent: '#2A1153',
    pillar: 'Interno',
    name_pt: 'Políticas Internas',
    name_en: 'Internal Policies',
    name_es: 'Políticas Internas',
    desc_pt: 'Políticas obrigatórias para colaboradores e operação interna.',
    desc_en: 'Mandatory policies for team members and internal operations.',
    desc_es: 'Políticas obligatorias para colaboradores y operación interna.',
  },
  {
    slug: 'links-recursos',
    accent: '#B8771A',
    pillar: 'Referência',
    name_pt: 'Links & Recursos',
    name_en: 'Links & Resources',
    name_es: 'Links & Recursos',
    desc_pt: 'Links úteis, recursos oficiais, intake dates e referências operacionais.',
    desc_en: 'Useful links, official resources, intake dates and operational references.',
    desc_es: 'Links útiles, recursos oficiales, intake dates y referencias operativas.',
  },
] as const

export type DepartmentSlug = (typeof DEPARTMENTS)[number]['slug']

export const DEPT_COLORS: Record<string, string> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.slug, d.accent])
)

export const DEPT_ACCENT = DEPT_COLORS

export function getDeptName(
  dept: (typeof DEPARTMENTS)[number],
  locale: string
): string {
  if (locale === 'pt') return dept.name_pt
  if (locale === 'es') return dept.name_es
  return dept.name_en
}

export function getDeptNameBySlug(slug: string, locale: string): string {
  const dept = DEPARTMENTS.find((d) => d.slug === slug)
  if (!dept) return slug
  return getDeptName(dept, locale)
}

export function getDeptDesc(
  dept: (typeof DEPARTMENTS)[number],
  locale: string
): string {
  if (locale === 'pt') return dept.desc_pt
  if (locale === 'es') return dept.desc_es
  return dept.desc_en
}
