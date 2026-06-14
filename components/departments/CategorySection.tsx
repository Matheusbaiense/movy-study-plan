'use client'

import Link from 'next/link'
import { useState } from 'react'
import { color, ink, font, t } from '@/lib/ui/theme'

interface Item {
  id: string
  slug: string
  title_pt: string
  title_en: string | null
  title_es: string | null
  summary: string | null
  content_type: string
  category: string | null
  read_minutes: number | null
  updated_at: string | null
}

interface Props {
  category: string
  items: Item[]
  locale: string
  deptColor: string
  typeLabels: Record<string, string>
}

export function CategorySection({ category, items, locale, deptColor, typeLabels }: Props) {
  const [open, setOpen] = useState(true)
  const titleFor = (item: Item) =>
    locale === 'en' ? (item.title_en || item.title_pt)
    : locale === 'es' ? (item.title_es || item.title_pt)
    : item.title_pt

  return (
    <div style={{ marginBottom: 18 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', marginBottom: 8 }}
      >
        <span className="movy-kicker" style={{ color: deptColor, fontSize: 11 }}>{category}</span>
        <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: ink(0.4) }}>{String(items.length).padStart(2, '0')}</span>
        <span style={{ marginLeft: 'auto', fontSize: 14, color: ink(0.3), transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>▾</span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/${locale}/wiki/${item.slug}`}
              prefetch={false}
              className="movy-card movy-card--hover"
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', textDecoration: 'none', borderLeft: `3px solid ${deptColor}` }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: font.display, fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.01em', color: t.text }}>{titleFor(item)}</div>
                <div style={{ fontFamily: font.mono, fontSize: 10.5, color: ink(0.45), marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {typeLabels[item.content_type ?? ''] ?? item.content_type ?? '—'}
                  {item.read_minutes ? ` · ${item.read_minutes} min` : ''}
                </div>
              </div>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color.orange} strokeWidth={2.2} strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
