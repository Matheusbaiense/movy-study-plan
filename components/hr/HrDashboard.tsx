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

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: '#92400e', bg: '#fef3c7' },
  approved: { label: 'Approved', color: '#166534', bg: '#dcfce7' },
  rejected: { label: 'Rejected', color: '#991b1b', bg: '#fee2e2' },
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
    border: `1px solid ${ink(0.15)}`, background: 'var(--bg)',
    color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: t.textMuted,
    letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 5,
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
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--surface)', borderRadius: 16, padding: 28,
        width: 420, maxWidth: '90vw',
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        border: `1px solid ${ink(0.12)}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: t.text, margin: 0 }}>
            {pt ? 'Lançar Horas' : 'Log Hours'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              placeholder={pt ? 'Ex: Reunião com cliente' : 'e.g. Client meeting'}
              style={inputStyle}
            />
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: '#fee2e2', borderRadius: 8, color: '#991b1b', fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${ink(0.15)}`, background: 'none', color: t.text, cursor: 'pointer', fontSize: 14 }}
          >
            {pt ? 'Cancelar' : 'Cancel'}
          </button>
          <button
            onClick={submit}
            disabled={isPending}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: color.purple, color: '#fff',
              cursor: isPending ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 600, opacity: isPending ? 0.7 : 1,
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

  // ── tab nav styles ─────────────────────────────────────────────────────────
  const tabActive: React.CSSProperties = {
    padding: '14px 16px', fontSize: 14, fontWeight: 600, color: t.text,
    borderBottom: `2px solid ${color.purple}`, marginBottom: -1,
    textDecoration: 'none', display: 'inline-block',
  }
  const tabInactive: React.CSSProperties = {
    padding: '14px 16px', fontSize: 14, color: t.textMuted,
    borderBottom: '2px solid transparent', marginBottom: -1,
    textDecoration: 'none', display: 'inline-block',
  }

  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${ink(0.1)}`, borderRadius: 16, overflow: 'hidden' }}>

      {/* Tab bar */}
      <div style={{ borderBottom: `1px solid ${ink(0.1)}`, padding: '0 24px', display: 'flex', gap: 2 }}>
        <span style={tabActive}>{pt ? 'Registro de Horas' : 'Timesheet'}</span>
        <a href={`/${locale}/hr/invoices`} style={tabInactive}>{pt ? 'Faturas' : 'Invoices'}</a>
        {isAdmin && (
          <a href={`/${locale}/hr/timesheets`} style={tabInactive}>
            {pt ? 'Todos os Registros' : 'All Timesheets'}
          </a>
        )}
      </div>

      <div style={{ padding: 24 }}>
        {/* Week header + actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: t.text }}>
              {pt ? 'Semana de' : 'Week of'} {weekLabel}
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 3 }}>
              {entries.length} {pt ? 'registros' : 'entries'}
              {totalWithLive > 0 && ` · ${formatHM(totalWithLive)}`}
              {pendingCount > 0 && ` · ${pendingCount} ${pt ? 'pendentes' : 'pending approval'}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {employee && (
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8,
                  border: `1px solid ${ink(0.2)}`, background: 'none',
                  color: t.text, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                }}
              >
                <Plus size={14} />
                {pt ? 'Lançar Horas' : 'Add Entry'}
              </button>
            )}
            {isAdmin && (
              <a
                href={`/${locale}/hr/invoices`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8,
                  background: color.purple, color: '#fff',
                  fontSize: 13, fontWeight: 600, textDecoration: 'none',
                }}
              >
                <FileText size={14} />
                {pt ? 'Gerar Fatura' : 'Generate Invoice'} →
              </a>
            )}
          </div>
        </div>

        {/* Table */}
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: t.textMuted, fontSize: 14 }}>
            {pt ? 'Nenhum registro esta semana.' : 'No entries this week.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${ink(0.1)}` }}>
                  {[
                    ...(isAdmin ? [pt ? 'Funcionário' : 'Employee'] : []),
                    pt ? 'Data' : 'Date',
                    pt ? 'Entrada' : 'In',
                    pt ? 'Saída' : 'Out',
                    pt ? 'Horas' : 'Hours',
                    pt ? 'Valor AU$' : 'Amount AU$',
                    'Status',
                    pt ? 'Ações' : 'Actions',
                  ].map((h) => (
                    <th key={h} style={{
                      padding: '8px 12px', textAlign: 'left',
                      fontWeight: 600, color: t.textMuted,
                      fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
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
                  const badge = STATUS_STYLES[e.status] ?? STATUS_STYLES.pending

                  return (
                    <tr key={e.id} style={{ borderBottom: `1px solid ${ink(0.06)}` }}>
                      {isAdmin && (
                        <td style={{ padding: '10px 12px', color: t.textMuted }}>
                          {employeeNameMap[e.employee_id] ?? e.employee_id.slice(0, 8)}
                        </td>
                      )}
                      <td style={{ padding: '10px 12px', color: t.text, fontWeight: isLive ? 600 : 400, whiteSpace: 'nowrap' }}>
                        {isLive && (
                          <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#4ade80', marginRight: 6, verticalAlign: 'middle' }} />
                        )}
                        {formatEntryDate(e.clock_in)}
                      </td>
                      <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums', color: t.text }}>
                        {formatTime(e.clock_in)}
                      </td>
                      <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums', color: t.textMuted }}>
                        {isLive
                          ? <span style={{ color: '#4ade80', fontWeight: 600 }}>LIVE</span>
                          : formatTime(e.clock_out!)}
                      </td>
                      <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums', color: t.text }}>
                        {hours !== null ? formatHM(hours) : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums', color: t.text }}>
                        {amount !== null ? formatAUD(amount) : '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {isLive ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#3b82f6', fontSize: 12, fontWeight: 600 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                            {pt ? 'Em andamento' : 'In progress'}
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: 20,
                            fontSize: 11, fontWeight: 600,
                            color: badge.color, background: badge.bg,
                          }}>
                            {badge.label}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {e.status === 'pending' && !isLive && isAdmin && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => approve(e.id)} disabled={isPending}
                              aria-label="Approve"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#16a34a' }}>
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => reject(e.id)} disabled={isPending}
                              aria-label="Reject"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#dc2626' }}>
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
        )}

        {/* Summary footer */}
        {entries.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 16, paddingTop: 16, borderTop: `1px solid ${ink(0.08)}`,
            fontSize: 13, color: t.textMuted, flexWrap: 'wrap', gap: 8,
          }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <span>
                {pt ? 'Aprovado:' : 'Approved:'}{' '}
                <strong style={{ color: '#16a34a' }}>{formatHM(approvedHours)}</strong>
              </span>
              {pendingHours > 0 && (
                <span>
                  {pt ? 'Pendente:' : 'Pending:'}{' '}
                  <strong style={{ color: '#92400e' }}>{formatHM(pendingHours)}</strong>
                </span>
              )}
            </div>
            {approvedTotalCents > 0 && (
              <span style={{ fontWeight: 700, color: t.text }}>
                {pt ? 'Total aprovado:' : 'Approved total:'} {formatAUD(approvedTotalCents)}
              </span>
            )}
          </div>
        )}
      </div>

      {showAdd && <AddEntryModal locale={locale} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
