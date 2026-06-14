'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { color, ink, font, t } from '@/lib/ui/theme'

interface Tab {
  href: string
  label: string
}

export function SettingsTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: `1px solid ${color.line}` }}>
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            prefetch={false}
            style={{
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: active ? 800 : 600,
              fontFamily: font.display,
              color: active ? t.text : ink(0.55),
              textDecoration: 'none',
              borderBottom: `2px solid ${active ? color.gold : 'transparent'}`,
              marginBottom: -1,
              transition: 'color .15s ease',
            }}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
