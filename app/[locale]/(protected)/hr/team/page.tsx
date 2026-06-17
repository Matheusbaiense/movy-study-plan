import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Clock, FileText, TrendingUp } from 'lucide-react'
import { getUser } from '@/lib/auth/get-user'
import { EditRateButton } from '@/components/hr/EditRateButton'
import { listEmployeesWithStats } from '@/lib/hr/queries'
import { isHrAdmin } from '@/lib/hr'
import { formatAUD } from '@/lib/hr/calculations'
import { t, ink, font, color } from '@/lib/ui/theme'

interface Props { params: Promise<{ locale: string }> }

function initials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const ROLE_CFG: Record<string, { label_pt: string; label_en: string; bg: string; text: string; dot: string }> = {
  super_admin: { label_pt: 'Super Admin', label_en: 'Super Admin', bg: 'rgba(75,26,119,0.12)', text: color.purple, dot: color.purple },
  admin:       { label_pt: 'Admin',       label_en: 'Admin',       bg: 'rgba(251,182,21,0.14)', text: '#b45309', dot: '#f59e0b' },
  employee:    { label_pt: 'Funcionário', label_en: 'Employee',     bg: 'rgba(34,197,94,0.10)', text: '#15803d', dot: '#22c55e' },
}

function RoleBadge({ role, locale }: { role: string; locale: string }) {
  const cfg = ROLE_CFG[role] ?? ROLE_CFG.employee
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 999,
      background: cfg.bg, fontSize: 11, fontWeight: 600, color: cfg.text,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot }} />
      {locale === 'pt' ? cfg.label_pt : cfg.label_en}
    </span>
  )
}

function StatPill({ icon: Icon, value, label, color: c }: { icon: typeof Clock; value: string; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Icon size={12} color={c} />
      <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{value}</span>
      <span style={{ fontSize: 11, color: t.textMuted }}>{label}</span>
    </div>
  )
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params
  const [{ profile }, supabase] = await Promise.all([
    getUser(locale),
    createClient(),
  ])

  if (!isHrAdmin(profile.role)) redirect(`/${locale}/hr`)

  const employees = await listEmployeesWithStats(supabase, profile.org_id)

  const totalHours  = employees.reduce((s, e) => s + e.hours_this_month, 0)
  const totalPending = employees.reduce((s, e) => s + e.pending_count, 0)
  const clockedIn   = employees.filter(e => e.is_clocked_in).length
  const pt = locale === 'pt'
  const totalEstimatedCents = employees.reduce((s, e) => s + e.estimated_cost_cents, 0)

  const monthName = new Date().toLocaleString(locale === 'pt' ? 'pt-AU' : 'en-AU', { month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: t.text, margin: 0, letterSpacing: '-0.02em' }}>
          {pt ? 'Equipe' : 'Team'}
        </h1>
        <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
          {pt ? 'Operações' : 'Operations'} › HR › {pt ? 'Equipe' : 'Team'}
        </div>
      </div>

      {/* Summary bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28,
      }}>
        {[
          { label: pt ? 'Funcionários' : 'Employees', value: String(employees.length), sub: pt ? 'cadastrados' : 'registered', accent: color.purple },
          { label: pt ? 'Trabalhando agora' : 'Working now', value: String(clockedIn), sub: pt ? 'com ponto aberto' : 'clocked in', accent: '#22c55e' },
          { label: pt ? 'Horas este mês' : 'Hours this month', value: totalHours.toFixed(1) + 'h', sub: monthName, accent: color.gold },
          { label: pt ? 'Folha Estimada' : 'Est. Payroll', value: formatAUD(totalEstimatedCents), sub: monthName, accent: '#16a34a' },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} style={{
            background: t.surface, border: `1px solid ${ink(0.08)}`,
            borderRadius: 12, padding: '16px 20px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: accent, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Employee grid */}
      {employees.length === 0 ? (
        <div style={{
          background: t.surface, border: `1px solid ${ink(0.08)}`,
          borderRadius: 14, padding: '56px 32px', textAlign: 'center',
        }}>
          <Users size={36} color={ink(0.2)} style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 6 }}>
            {pt ? 'Nenhum funcionário cadastrado' : 'No employees yet'}
          </div>
          <div style={{ fontSize: 13, color: t.textMuted }}>
            {pt
              ? 'Funcionários aparecem aqui quando criam um perfil de funcionário.'
              : 'Employees appear here once they create an employee profile.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {employees.map(emp => {
            const ini = initials(emp.full_name || emp.email)
            const rate = (emp.hourly_rate_in_cents / 100).toFixed(2)

            return (
              <div key={emp.id} style={{
                background: t.surface,
                border: `1px solid ${ink(emp.is_clocked_in ? 0.0 : 0.08)}`,
                outline: emp.is_clocked_in ? `2px solid rgba(34,197,94,0.35)` : 'none',
                borderRadius: 14, padding: '20px 22px',
                display: 'flex', flexDirection: 'column', gap: 14,
                position: 'relative', overflow: 'hidden',
              }}>

                {/* Clocked-in glow */}
                {emp.is_clocked_in && (
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: 80, height: 80,
                    background: 'radial-gradient(circle at top right, rgba(34,197,94,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }} />
                )}

                {/* Top: avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${color.purple} 0%, ${color.purpleMid} 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 17, fontWeight: 700, color: '#fff', fontFamily: font.display,
                      letterSpacing: '0.02em',
                    }}>
                      {ini}
                    </div>
                    {emp.is_clocked_in && (
                      <span style={{
                        position: 'absolute', bottom: 1, right: 1,
                        width: 11, height: 11, borderRadius: '50%',
                        background: '#22c55e',
                        border: `2px solid ${t.surface}`,
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 700, color: t.text,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {emp.full_name || '—'}
                    </div>
                    <div style={{
                      fontSize: 11, color: t.textMuted, marginTop: 1,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {emp.email}
                    </div>
                  </div>
                </div>

                {/* Role + rate */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <RoleBadge role={emp.role} locale={locale} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>
                      AU${rate}<span style={{ fontWeight: 400, color: t.textMuted, fontSize: 11 }}>/hr</span>
                    </span>
                    <EditRateButton employeeId={emp.id} currentRateCents={emp.hourly_rate_in_cents} />
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: ink(0.07) }} />

                {/* Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <StatPill
                    icon={Clock}
                    value={emp.hours_this_month.toFixed(1) + 'h'}
                    label={pt ? 'este mês (aprovado)' : 'this month (approved)'}
                    color={color.gold}
                  />
                  {emp.estimated_cost_cents > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
                        {formatAUD(emp.estimated_cost_cents)}
                      </span>
                      <span style={{ fontSize: 11, color: t.textMuted }}>{pt ? 'estimado este mês' : 'est. this month'}</span>
                    </div>
                  )}
                  {emp.pending_count > 0 && (
                    <StatPill
                      icon={TrendingUp}
                      value={String(emp.pending_count)}
                      label={pt ? 'pendente(s) de aprovação' : 'pending approval'}
                      color='#f59e0b'
                    />
                  )}
                  {emp.is_clocked_in && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#15803d' }}>
                        {pt ? 'Trabalhando agora' : 'Currently working'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <Link
                    href={`/${locale}/hr/timesheets?employee=${emp.id}`}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '8px 12px', borderRadius: 8,
                      background: ink(0.04), border: `1px solid ${ink(0.1)}`,
                      fontSize: 12, fontWeight: 600, color: t.text, textDecoration: 'none',
                    }}
                  >
                    <Clock size={13} />
                    {pt ? 'Horas' : 'Timesheets'}
                  </Link>
                  <Link
                    href={`/${locale}/hr/invoices?employee=${emp.id}`}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '8px 12px', borderRadius: 8,
                      background: `${color.purple}10`, border: `1px solid ${color.purple}25`,
                      fontSize: 12, fontWeight: 600, color: t.accent, textDecoration: 'none',
                    }}
                  >
                    <FileText size={13} />
                    {pt ? 'Invoices' : 'Invoices'}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
