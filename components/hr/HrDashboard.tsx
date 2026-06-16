'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, XCircle, Plus, FileText, X } from 'lucide-react'
import type { TimeEntry, EmployeeProfile } from '@/lib/hr/types'
import { calculateHours, formatAUD } from '@/lib/hr/calculations'
import {
  approveEntryAction,
  rejectEntryAction,
  logHoursAction,
} from '@/app/[locale]/(protected)/hr/actions'
import { t, ink, color, font } from '@/lib/ui/theme'

// ── helpers ───────────────────────────────────────────────────────────────────

function formatHM(h: number): string {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return mm > 0 ? `${hh}h ${mm}m` : `${hh}h`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function formatEntryDate(iso: string): string {
  const d = new Date(iso)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${days[d.getDay()]} ${dd}/${mm}`
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
  pending:  { label: 'Pending',  dot: '#f59e0b', text: '#92400e', bg: '#fffbeb', border: '#fde68a' },
  approved: { label: 'Approved', dot: '#22c55e', text: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
  rejected: { label: 'Rejected', dot: '#ef4444', text: '#991b1b', bg: '#fef2f2', border: '#fecaca' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 999,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      fontSize: 11, fontWeight: 600, color: cfg.text,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

// ── AddEntryModal ─────────────────────────────────────────────────────────────

interface AddEntryModalProps {
  locale: string
  onClose: () => void
}

function AddEntryModal({ locale, onClose }: AddEntryModalProps) {
  const [isPending, startTransition] = useTransition()
  const [date, setDate] = useState(todayISO())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [desc, setDesc] = useState('')
  const [error, setError] = useState<string | null>(null)
  const pt = locale === 'pt'

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: `1px solid ${ink(0.14)}`,
    background: 'var(--bg)',
    color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: t.textMuted,
    letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5,
  }

  function submit() {
    setError(null)
    startTransition(async () => {
      try {
        await logHoursAction(date, startTime, endTime, desc || undefined)
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to log hours')
      }
    })
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--surface)', borderRadius: 18, padding: 28,
        width: 420, maxWidth: '90vw',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        border: `1px solid ${ink(0.1)}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <h2 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: t.text, margin: 0 }}>
              {pt ? 'Lançar Horas' : 'Log Hours'}
            </h2>
            <p style={{ fontSize: 12, color: t.textMuted, margin: '3px 0 0' }}>
              {pt ? 'Registro de ponto manual' : 'Manual time entry'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, padding: 6, borderRadius: 8, lineHeight: 0 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>{pt ? 'Data' : 'Date'}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>{pt ? 'Início' : 'Start'}</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{pt ? 'Fim' : 'End'}</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>{pt ? 'Descrição (opcional)' : 'Description (optional)'}</label>
            <input
              type="text" value={desc} onChange={e => setDesc(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit() }}
              placeholder={pt ? 'Ex: Reunião com cliente' : 'e.g. Client meeting'}
              style={inputStyle}
            />
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${ink(0.14)}`, background: 'none', color: t.text, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
          >
            {pt ? 'Cancelar' : 'Cancel'}
          </button>
          <button
            onClick={submit}
            disabled={isPending}
            style={{
              padding: '9px 22px', borderRadius: 9, border: 'none',
              background: color.purple, color: '#fff',
              cursor: isPending ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600, opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? '...' : (pt ? 'Salvar' : 'Save')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── HrDashboard ───────────────────────────────────────────────────────────────

interface HrDashboardProps {
  entries: TimeEntry[]
  employeeNameMap: Record<string, string>
  employee: EmployeeProfile | null
  hourlyRateCents: number
  locale: string
  isAdmin: boolean
  weekLabel: string
  weekStart: string
}

export function HrDashboard({
  entries, employeeNameMap, employee, hourlyRateCents,
  locale, isAdmin, weekLabel,
}: HrDashboardProps) {
  const [isPending, startTransition] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const pt = locale === 'pt'

  function approve(id: string) {
    startTransition(async () => { await approveEntryAction(id) })
  }
  function reject(id: string) {
    startTransition(async () => { await rejectEntryAction(id) })
  }

  // ── summary ────────────────────────────────────────────────────────────────
  const liveEntry = entries.find(e => !e.clock_out)
  const liveHours = liveEntry ? calculateHours(new Date(liveEntry.clock_in), new Date()) : 0

  const completedEntries = entries.filter(e => e.clock_out)
  const approvedHours = completedEntries
    .filter(e => e.status === 'approved')
    .reduce((s, e) => s + calculateHours(new Date(e.clock_in), new Date(e.clock_out!)), 0)
  const pendingHours = completedEntries
    .filter(e => e.status === 'pending')
    .reduce((s, e) => s + calculateHours(new Date(e.clock_in), new Date(e.clock_out!)), 0)
  const totalHours = completedEntries.reduce((s, e) => s + calculateHours(new Date(e.clock_in), new Date(e.clock_out!)), 0)
  const totalWithLive = totalHours + liveHours
  const pendingCount = entries.filter(e => e.status === 'pending').length
  const approvedTotalCents = Math.round(approvedHours * hourlyRateCents)

  // ── tab styles ─────────────────────────────────────────────────────────────
  const tabBase: React.CSSProperties = {
    padding: '13px 16px', fontSize: 13, fontWeight: 500,
    borderBottom: '2px solid transparent', marginBottom: -1,
    textDecoration: 'none', display: 'inline-block', transition: 'color 0.15s',
    whiteSpace: 'nowrap',
  }

  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${ink(0.1)}`, borderRadius: 16, overflow: 'hidden' }}>

      {/* Tab bar */}
      <div style={{ borderBottom: `1px solid ${ink(0.08)}`, padding: '0 20px', display: 'flex', gap: 2 }}>
        <span style={{ ...tabBase, color: t.text, fontWeight: 600, borderBottomColor: color.purple }}>
          {pt ? 'Registro de Horas' : 'Timesheet'}
        </span>
        <a href={`/${locale}/hr/invoices`} style={{ ...tabBase, color: t.textMuted }}>
          {pt ? 'Faturas' : 'Invoices'}
        </a>
        {isAdmin && (
          <a href={`/${locale}/hr/timesheets`} style={{ ...tabBase, color: t.textMuted }}>
            {pt ? 'Todos os Registros' : 'All Timesheets'}
          </a>
        )}
      </div>

      <div style={{ padding: '20px 24px' }}>

        {/* Week header + actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: font.display, fontSize: 17, fontWeight: 700, color: t.text, letterSpacing: '-0.01em' }}>
              {pt ? 'Semana de' : 'Week of'} {weekLabel}
            </div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 3, display: 'flex', gap: 10 }}>
              <span>{entries.length} {pt ? 'registros' : 'entries'}</span>
              {totalWithLive > 0 && <span>·  {formatHM(totalWithLive)} {pt ? 'total' : 'total'}</span>}
              {pendingCount > 0 && (
                <span style={{ color: '#92400e' }}>· {pendingCount} {pt ? 'pendentes' : 'pending'}</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            {employee && (
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8,
                  border: `1px solid ${ink(0.18)}`, background: 'none',
                  color: t.text, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                }}
              >
                <Plus size={13} />
                {pt ? 'Lançar Horas' : 'Add Entry'}
              </button>
            )}
            {isAdmin && (
              <a
                href={`/${locale}/hr/invoices`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 16px', borderRadius: 8,
                  background: color.purple, color: '#fff',
                  fontSize: 13, fontWeight: 600, textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <FileText size={13} />
                {pt ? 'Gerar Fatura' : 'Generate Invoice'} →
              </a>
            )}
          </div>
        </div>

        {/* Table */}
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '52px 0', color: t.textMuted, fontSize: 14 }}>
            <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.4 }}>○</div>
            {pt ? 'Nenhum registro esta semana.' : 'No entries this week.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {[
                    ...(isAdmin ? [pt ? 'Funcionário' : 'Employee'] : []),
                    pt ? 'Data' : 'Date',
                    pt ? 'Entrada' : 'In',
                    pt ? 'Saída' : 'Out',
                    pt ? 'Horas' : 'Hours',
                    pt ? 'Valor AU$' : 'Amount AU$',
                    'Status',
                    '',
                  ].map((h, i) => (
                    <th key={i} style={{
                      padding: '6px 12px 10px', textAlign: 'left',
                      fontWeight: 600, color: t.textMuted,
                      fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                      whiteSpace: 'nowrap', borderBottom: `1px solid ${ink(0.08)}`,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const isLive = !e.clock_out
                  const hours = isLive
                    ? calculateHours(new Date(e.clock_in), new Date())
                    : e.clock_out ? calculateHours(new Date(e.clock_in), new Date(e.clock_out)) : null
                  const amount = hours !== null ? Math.round(hours * hourlyRateCents) : null
                  const isHovered = hoveredRow === e.id

                  return (
                    <tr
                      key={e.id}
                      onMouseEnter={() => setHoveredRow(e.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        borderBottom: `1px solid ${ink(0.05)}`,
                        background: isHovered ? ink(0.03) : 'transparent',
                        transition: 'background 0.1s ease',
                      }}
                    >
                      {isAdmin && (
                        <td style={{ padding: '11px 12px', color: t.textMuted, fontSize: 12 }}>
                          {employeeNameMap[e.employee_id] ?? e.employee_id.slice(0, 8)}
                        </td>
                      )}
                      <td style={{ padding: '11px 12px', color: t.text, fontWeight: isLive ? 600 : 400, whiteSpace: 'nowrap' }}>
                        {isLive && (
                          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#4ade80', marginRight: 7, verticalAlign: 'middle', boxShadow: '0 0 6px rgba(74,222,128,0.7)' }} />
                        )}
                        {formatEntryDate(e.clock_in)}
                      </td>
                      <td style={{ padding: '11px 12px', fontVariantNumeric: 'tabular-nums', color: t.text }}>
                        {formatTime(e.clock_in)}
                      </td>
                      <td style={{ padding: '11px 12px', fontVariantNumeric: 'tabular-nums', color: isLive ? '#22c55e' : t.textMuted, fontWeight: isLive ? 600 : 400 }}>
                        {isLive ? 'LIVE' : formatTime(e.clock_out!)}
                      </td>
                      <td style={{ padding: '11px 12px', fontVariantNumeric: 'tabular-nums', color: t.text }}>
                        {hours !== null ? formatHM(hours) : '—'}
                      </td>
                      <td style={{ padding: '11px 12px', fontVariantNumeric: 'tabular-nums', color: t.text }}>
                        {amount !== null ? formatAUD(amount) : '—'}
                      </td>
                      <td style={{ padding: '11px 12px' }}>
                        {isLive ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#3b82f6', fontSize: 11, fontWeight: 600 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                            {pt ? 'Em andamento' : 'In progress'}
                          </span>
                        ) : (
                          <StatusBadge status={e.status ?? 'pending'} />
                        )}
                      </td>
                      <td style={{ padding: '11px 12px' }}>
                        {e.status === 'pending' && !isLive && isAdmin && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              onClick={() => approve(e.id)} disabled={isPending}
                              title={pt ? 'Aprovar' : 'Approve'}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 6, color: '#16a34a', lineHeight: 0 }}
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button
                              onClick={() => reject(e.id)} disabled={isPending}
                              title={pt ? 'Rejeitar' : 'Reject'}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 6, color: '#dc2626', lineHeight: 0 }}
                            >
                              <XCircle size={15} />
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
        )}

        {/* Summary footer */}
        {entries.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 16, paddingTop: 14,
            borderTop: `1px solid ${ink(0.07)}`,
            flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  {pt ? 'Aprovado' : 'Approved'}
                </span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#16a34a', fontVariantNumeric: 'tabular-nums' }}>
                  {formatHM(approvedHours)}
                </span>
              </div>
              {pendingHours > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                    {pt ? 'Pendente' : 'Pending'}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#d97706', fontVariantNumeric: 'tabular-nums' }}>
                    {formatHM(pendingHours)}
                  </span>
                </div>
              )}
            </div>
            {approvedTotalCents > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'right' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  {pt ? 'Total Aprovado' : 'Approved Total'}
                </span>
                <span style={{ fontSize: 17, fontWeight: 800, color: t.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
                  {formatAUD(approvedTotalCents)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {showAdd && <AddEntryModal locale={locale} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
