'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { key: 'overview', segment: 'settings', label_pt: 'Visão Geral', label_en: 'Overview', label_es: 'Resumen' },
  { key: 'users', segment: 'settings/users', label_pt: 'Usuários', label_en: 'Users', label_es: 'Usuarios' },
  { key: 'audit-log', segment: 'settings/audit-log', label_pt: 'Audit Log', label_en: 'Audit Log', label_es: 'Audit Log' },
]

export function SettingsTabNav({ locale }: { locale: string }) {
  const pathname = usePathname()

  function isActive(segment: string): boolean {
    const full = `/${locale}/${segment}`
    return pathname === full || pathname === `${full}/`
  }

  return (
    <nav style={{
      display: 'flex',
      gap: 0,
      borderBottom: '1px solid rgba(28,18,51,0.08)',
      marginBottom: 24,
      marginTop: 20,
    }}>
      {TABS.map((tab) => {
        const active = isActive(tab.segment)
        const label = locale === 'pt' ? tab.label_pt : locale === 'es' ? tab.label_es : tab.label_en

        return (
          <Link
            key={tab.key}
            href={`/${locale}/${tab.segment}`}
            style={{
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 600,
              color: active ? '#F36B1C' : '#2A1153',
              textDecoration: 'none',
              fontFamily: 'Outfit, sans-serif',
              borderBottom: active ? '2px solid #F36B1C' : '2px solid transparent',
              marginBottom: -1,
              transition: 'border-color 0.15s ease, color 0.15s ease',
            }}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
