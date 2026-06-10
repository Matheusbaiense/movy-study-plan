'use client'

import Link from 'next/link'
import { STATUS_STYLES, getStatusLabel } from '@/lib/constants/content'

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
      style={{
        display: 'flex', gap: 18, alignItems: 'center',
        padding: '18px 20px', borderRadius: 18,
        background: '#fff', border: '1px solid rgba(28,18,51,0.06)',
        boxShadow: '0 1px 2px rgba(28,18,51,0.04)',
        textDecoration: 'none', transition: 'box-shadow .2s ease, transform .2s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = '0 8px 28px rgba(28,18,51,0.08)'
        el.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = '0 1px 2px rgba(28,18,51,0.04)'
        el.style.transform = 'none'
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
              padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              background: `${accent}14`, color: accent,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: accent }} />
              {deptName}
            </span>
          )}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            background: statusStyle.bg, color: statusStyle.fg,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: statusStyle.dot }} />
            {getStatusLabel(status, locale)}
          </span>
        </div>

        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#2A1153' }}>
          {title}
        </h3>
        {excerpt && (
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(28,18,51,0.6)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {excerpt}
          </p>
        )}

        <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, color: 'rgba(28,18,51,0.5)' }}>
          <span>{updatedDate}</span>
          {tags && tags.length > 0 && (
            <>
              <span>&middot;</span>
              <span>#{tags[0]}</span>
            </>
          )}
        </div>
      </div>

      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(28,18,51,0.3)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l6 6-6 6"/>
      </svg>
    </Link>
  )
}
