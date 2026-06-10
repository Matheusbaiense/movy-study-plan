export const DEPARTMENTS = [
  {
    slug: 'commercial',
    accent: '#E72C03',
    pillar: 'Career',
    name_pt: 'Comercial',
    name_en: 'Commercial',
    name_es: 'Comercial',
    desc_pt: 'Gestão de parcerias, propostas e pipeline comercial.',
    desc_en: 'Partnership management, proposals and commercial pipeline.',
    desc_es: 'Gestión de asociaciones, propuestas y pipeline comercial.',
  },
  {
    slug: 'student-support',
    accent: '#057570',
    pillar: 'Education',
    name_pt: 'Student Support',
    name_en: 'Student Support',
    name_es: 'Student Support',
    desc_pt: 'Suporte completo ao estudante desde a matrícula até o diploma.',
    desc_en: 'Full student support from enrollment to graduation.',
    desc_es: 'Soporte completo al estudiante desde la matrícula hasta la graduación.',
  },
  {
    slug: 'visa',
    accent: '#FF8B00',
    pillar: 'Migration',
    name_pt: 'Visa',
    name_en: 'Visa',
    name_es: 'Visa',
    desc_pt: 'Processos migratórios, vistos e compliance regulatório.',
    desc_en: 'Migration processes, visas and regulatory compliance.',
    desc_es: 'Procesos migratorios, visados y cumplimiento normativo.',
  },
  {
    slug: 'marketing',
    accent: '#8B5CF6',
    pillar: 'Backbone',
    name_pt: 'Marketing',
    name_en: 'Marketing',
    name_es: 'Marketing',
    desc_pt: 'Campanhas, conteúdo, growth e brand da Movy.',
    desc_en: 'Campaigns, content, growth and Movy brand.',
    desc_es: 'Campañas, contenido, growth y marca Movy.',
  },
  {
    slug: 'technology',
    accent: '#03182D',
    pillar: 'Backbone',
    name_pt: 'Tecnologia',
    name_en: 'Technology',
    name_es: 'Tecnología',
    desc_pt: 'Infraestrutura, integrações, automações e produto digital.',
    desc_en: 'Infrastructure, integrations, automation and digital product.',
    desc_es: 'Infraestructura, integraciones, automatizaciones y producto digital.',
  },
  {
    slug: 'finance',
    accent: '#10B981',
    pillar: 'Operations',
    name_pt: 'Financeiro',
    name_en: 'Finance',
    name_es: 'Finanzas',
    desc_pt: 'Contas a pagar, receber, reconciliação e relatórios financeiros.',
    desc_en: 'Accounts payable, receivable, reconciliation and financial reports.',
    desc_es: 'Cuentas por pagar, cobrar, conciliación e informes financieros.',
  },
  {
    slug: 'administrative',
    accent: '#6366F1',
    pillar: 'Operations',
    name_pt: 'Administrativo',
    name_en: 'Administrative',
    name_es: 'Administrativo',
    desc_pt: 'Processos internos, compliance, RH e operações do escritório.',
    desc_en: 'Internal processes, compliance, HR and office operations.',
    desc_es: 'Procesos internos, compliance, RRHH y operaciones de oficina.',
  },
] as const

export type DepartmentSlug = (typeof DEPARTMENTS)[number]['slug']

export const DEPT_COLORS: Record<string, string> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.slug, d.accent])
)

// Alias kept for backwards compatibility with campaigns/wiki pages
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
