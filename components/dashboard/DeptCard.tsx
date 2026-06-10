'use client'

import Link from 'next/link'

interface DeptCardProps {
  slug: string
  accent: string
  pillar: string
  name: string
  desc: string
  locale: string
}

export function DeptCard({ slug, accent, pillar, name, desc, locale }: DeptCardProps) {
  return (
    <Link
      href={`/${locale}/departments/${slug}`}
      style={{
        background: '#fff', borderRadius: 18, border: '1px solid rgba(3,24,45,0.06)',
        padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        textDecoration: 'none', boxShadow: '0 1px 2px rgba(3,24,45,0.04)',
        transition: 'box-shadow .2s ease, transform .2s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = '0 8px 28px rgba(3,24,45,0.08)'
        el.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = '0 1px 2px rgba(3,24,45,0.04)'
        el.style.transform = 'none'
      }}
    >
      <div style={{ height: 6, background: accent }} />
      <div style={{ padding: '18px 20px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: accent,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: accent }} />
            {pillar}
          </span>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(3,24,45,0.4)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>
        <h3 style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 600, color: '#03182D', letterSpacing: '-0.01em' }}>
          {name}
        </h3>
        <p style={{ margin: '0 0 14px', fontSize: 13, color: 'rgba(3,24,45,0.6)', lineHeight: 1.5 }}>
          {desc}
        </p>
      </div>
    </Link>
  )
}
