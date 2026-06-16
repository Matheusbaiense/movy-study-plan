// components/ui/Tabs.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { t } from '@/lib/ui/theme'
import { isTabActive } from './tabs-logic'

export interface TabItem {
  label: string
  href: string
}

export function Tabs({ items }: { items: TabItem[] }) {
  const pathname = usePathname()
  return (
    <nav style={{ borderBottom: `1px solid ${t.border}`, marginBottom: 24 }}>
      <ul style={{ display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0, overflowX: 'auto' }}>
        {items.map((tab) => {
          const active = isTabActive(pathname, tab.href)
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                prefetch={false}
                aria-current={active ? 'page' : undefined}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 40,
                  padding: '0 18px',
                  marginBottom: -1,
                  borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                  color: active ? t.text : t.textMuted,
                  fontFamily: 'var(--font-body)',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
