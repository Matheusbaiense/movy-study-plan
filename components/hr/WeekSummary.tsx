'use client'

import type { TimeEntry } from '@/lib/hr/types'
import { calculateHours } from '@/lib/hr/calculations'
import { t, ink, color, font } from '@/lib/ui/theme'

interface WeekSummaryProps {
  entries: TimeEntry[]
  locale: string
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_LABELS_PT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function getWeekDates(): string[] {
  const now = new Date()
  const dow = now.getDay() // 0=Sun
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

const STATUS_COLOR: Record<string, string> = {
  approved: '#4ade80',
  pending: '#fbbf24',
  rejected: '#f87171',
}

export function WeekSummary({ entries, locale }: WeekSummaryProps) {
  const days = getWeekDates()
  const labels = locale === 'pt' ? DAY_LABELS_PT : DAY_LABELS
  const MAX_HOURS = 10

  const byDay = days.map((iso) => {
    const dayEntries = entries.filter((e) => e.clock_in.startsWith(iso))
    const totalHours = dayEntries.reduce((sum, e) => {
      if (!e.clock_out) return sum
      return sum + calculateHours(new Date(e.clock_in), new Date(e.clock_out))
    }, 0)
    return { iso, totalHours, entries: dayEntries }
  })

  return (
    <div style={{ padding: '16px 0' }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: t.textMuted,
          marginBottom: 12,
          textTransform: 'uppercase',
          fontFamily: font.ui,
        }}
      >
        {locale === 'pt' ? 'Esta Semana' : 'This Week'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {byDay.map(({ iso, totalHours, entries: dayEntries }, i) => (
          <div key={iso} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: t.textSubtle,
                width: 28,
                flexShrink: 0,
                fontFamily: font.ui,
              }}
            >
              {labels[i]}
            </span>
            <div
              style={{
                flex: 1,
                height: 6,
                background: ink(0.08),
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min((totalHours / MAX_HOURS) * 100, 100)}%`,
                  height: '100%',
                  background: totalHours > 0 ? color.purple : 'transparent',
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <span
              style={{
                fontSize: 10,
                color: t.textSubtle,
                width: 32,
                textAlign: 'right',
                flexShrink: 0,
                fontVariantNumeric: 'tabular-nums',
                fontFamily: font.mono,
              }}
            >
              {totalHours > 0 ? `${totalHours.toFixed(1)}h` : '—'}
            </span>
            <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
              {dayEntries.slice(0, 3).map((e) => (
                <div
                  key={e.id}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: STATUS_COLOR[e.status ?? ''] ?? ink(0.2),
                  }}
                  title={e.status ?? undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
