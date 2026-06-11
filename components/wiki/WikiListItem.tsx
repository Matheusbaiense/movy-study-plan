'use client'

import Link from 'next/link'
import { STATUS_STYLES, getStatusLabel } from '@/lib/constants/content'
import { color, ink, font } from '@/lib/ui/theme'

interface WikiListItemProps {
  href: string
  accent: string
  deptName: string
  status: string
  title: string
  excerpt: string
  updatedDate: string
  tags: string[] | null
  locale: string
}

export function WikiListItem({ href, accent, deptName, status, title, excerpt, updatedDate, tags, locale }: WikiListItemProps) {
  const statusStyle = STATUS_STYLES[status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.draft

  return (
    <Link
      href={href}
      prefetch={false}
      className="movy-card movy-card--hover"
      style={{
        display: 'flex', gap: 18, alignItems: 'center',
        padding: '18px 20px', textDecoration: 'none',
      }}
    >
      {/* Dept icon */}
      <span style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${accent}14`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z"/>
          <path d="M4 17a3 3 0 0 1 3-3h11"/>
        </svg>
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          {deptName && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: `${accent}14`, color: accent,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: accent }} />
              {deptName}
            </span>
          )}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            background: statusStyle.bg, color: statusStyle.fg,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: statusStyle.dot }} />
            {getStatusLabel(status, locale)}
          </span>
        </div>

        <h3 style={{ margin: '0 0 4px', fontFamily: font.display, fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', color: color.purpleDeep }}>
          {title}
        </h3>
        {excerpt && (
          <p style={{ margin: 0, fontSize: 13, color: ink(0.6), lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {excerpt}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontFamily: font.mono, fontSize: 11, color: ink(0.45) }}>
          <span>{updatedDate}</span>
          {tags && tags.length > 0 && (
            <>
              <span>&middot;</span>
              <span>#{tags[0]}</span>
            </>
          )}
        </div>
      </div>

      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={ink(0.3)} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l6 6-6 6"/>
      </svg>
    </Link>
  )
}
