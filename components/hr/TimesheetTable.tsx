'use client'

import { useTransition } from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import type { TimeEntry } from '@/lib/hr/types'
import { calculateHours, formatDateAU, formatAUD } from '@/lib/hr/calculations'
import { approveEntryAction, rejectEntryAction } from '@/app/[locale]/(protected)/hr/actions'
import { t, ink } from '@/lib/ui/theme'

interface TimesheetTableProps {
  entries: TimeEntry[]
  hourlyRateCents: number
  locale: string
  showEmployeeName?: boolean
}

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: '#92400e', bg: '#fef3c7' },
  approved: { label: 'Approved', color: '#166534', bg: '#dcfce7' },
  rejected: { label: 'Rejected', color: '#991b1b', bg: '#fee2e2' },
}

const DAY_TYPE_LABEL: Record<string, string> = {
  weekday:        'Weekday',
  saturday:       'Saturday',
  sunday:         'Sunday',
  public_holiday: 'Holiday',
}

export function TimesheetTable({ entries, hourlyRateCents, locale, showEmployeeName }: TimesheetTableProps) {
  const [isPending, startTransition] = useTransition()

  function approve(id: string) {
    startTransition(async () => { await approveEntryAction(id) })
  }

  function reject(id: string) {
    startTransition(async () => { await rejectEntryAction(id) })
  }

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: t.textMuted, fontSize: 14 }}>
        {locale === 'pt' ? 'Nenhum registro encontrado.' : 'No entries found.'}
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${ink(0.1)}` }}>
            {(showEmployeeName ? ['Employee', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Day Type', 'Amount', 'Status', 'Actions'] : ['Date', 'Clock In', 'Clock Out', 'Hours', 'Day Type', 'Amount', 'Status', 'Actions']).map((h) => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: t.textMuted, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const hours = e.clock_out ? calculateHours(new Date(e.clock_in), new Date(e.clock_out)) : null
            const amount = hours !== null ? Math.round(hours * hourlyRateCents) : null
            const badge = STATUS_BADGE[e.status] ?? STATUS_BADGE.pending
            const isLive = !e.clock_out
            return (
              <tr key={e.id} style={{ borderBottom: `1px solid ${ink(0.06)}` }}>
                {showEmployeeName && (
                  <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums', color: t.textMuted }}>
                    {e.employee_id.slice(0, 8)}
                  </td>
                )}
                <td style={{ padding: '10px 12px' }}>
                  {isLive && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 6 }}>
                      <Clock size={12} style={{ color: '#4ade80' }} />
                    </span>
                  )}
                  {formatDateAU(e.clock_in.slice(0, 10))}
                </td>
                <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>
                  {new Date(e.clock_in).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ padding: '10px 12px', color: t.textMuted, fontVariantNumeric: 'tabular-nums' }}>
                  {e.clock_out
                    ? new Date(e.clock_out).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
                    : <span style={{ color: '#4ade80', fontWeight: 600 }}>LIVE</span>}
                </td>
                <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>
                  {hours !== null ? `${hours.toFixed(2)}h` : '—'}
                </td>
                <td style={{ padding: '10px 12px', color: t.textMuted }}>
                  {DAY_TYPE_LABEL[e.day_type] ?? e.day_type}
                </td>
                <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>
                  {amount !== null ? formatAUD(amount) : '—'}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 20,
                    fontSize: 11, fontWeight: 600,
                    color: badge.color, background: badge.bg,
                  }}>
                    {badge.label}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {e.status === 'pending' && !isLive && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => approve(e.id)}
                        disabled={isPending}
                        title="Approve"
                        aria-label="Approve"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#16a34a' }}
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => reject(e.id)}
                        disabled={isPending}
                        title="Reject"
                        aria-label="Reject"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#dc2626' }}
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
