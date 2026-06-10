'use client'

import Link from 'next/link'
import { useState } from 'react'

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
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: '#2A1153' }}>{category}</span>
        <span style={{
          fontSize: 12, color: 'rgba(28,18,51,0.4)',
          background: 'rgba(28,18,51,0.06)', borderRadius: 10, padding: '1px 7px',
        }}>
          {items.length}
        </span>
        <span style={{
          marginLeft: 'auto', fontSize: 16, color: 'rgba(28,18,51,0.3)',
          transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 0.15s',
        }}>
          ▾
        </span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map(item => (
            <Link
              key={item.id}
              href={`/${locale}/wiki/${item.slug}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 10, background: '#fff',
                border: '1px solid rgba(28,18,51,0.06)', textDecoration: 'none',
                borderLeft: `3px solid ${deptColor}`,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#2A1153' }}>{titleFor(item)}</div>
                <div style={{ fontSize: 11, color: 'rgba(28,18,51,0.45)', marginTop: 2 }}>
                  {typeLabels[item.content_type ?? ''] ?? item.content_type ?? '—'}
                  {item.read_minutes ? ` · ${item.read_minutes} min` : ''}
                </div>
              </div>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(28,18,51,0.3)" strokeWidth={2} strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
