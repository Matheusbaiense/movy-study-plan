import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClockWidget } from '@/components/hr/ClockWidget'
import { WeekSummary } from '@/components/hr/WeekSummary'
import { HrDashboard } from '@/components/hr/HrDashboard'
import {
  getEmployeeByProfileId, getActiveClockEntry,
  listTimeEntries, listEmployeesWithNames, isHrAdmin,
} from '@/lib/hr'
import { t, ink, font } from '@/lib/ui/theme'

interface Props { params: Promise<{ locale: string }> }

export default async function HrPage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect(`/${locale}/login`)

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, org_id, role')
    .eq('id', user.id)
    .single()
  if (profileError || !profile) redirect(`/${locale}/login`)

  const isAdmin = isHrAdmin(profile.role)
  const employee = await getEmployeeByProfileId(supabase, profile.org_id, profile.id)
  const activeEntry = employee ? await getActiveClockEntry(supabase, employee.id) : null

  // Non-admin with no employee profile: show friendly message
  if (!isAdmin && !employee) {
    return (
      <div style={{ padding: '48px 32px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>🕐</div>
        <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 8 }}>
          {locale === 'pt' ? 'Sem perfil de funcionário' : 'No employee profile'}
        </div>
        <div style={{ fontSize: 14, color: t.textMuted }}>
          {locale === 'pt'
            ? 'Fale com o administrador para criar seu perfil e começar a registrar horas.'
            : 'Contact your administrator to create your employee profile and start tracking hours.'}
        </div>
      </div>
    )
  }

  // Week bounds (Mon–Sun, local date — avoid toISOString UTC drift)
  const now = new Date()
  const dow = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const pad = (n: number) => String(n).padStart(2, '0')
  const weekStart = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const weekLabel = `${months[monday.getMonth()]} ${monday.getDate()}–${sunday.getDate()}, ${sunday.getFullYear()}`

  // Entries: admin sees all org entries for the week; employee sees only their own
  const entries = await listTimeEntries(supabase, profile.org_id, {
    ...(isAdmin ? {} : { employeeId: employee!.id }),
    from: weekStart,
  })

  // Own entries for the WeekSummary bars (only relevant if has employee profile)
  const ownEntries = employee && isAdmin
    ? entries.filter(e => e.employee_id === employee.id)
    : entries

  // Employee name map for admin table (id → display name)
  let employeeNameMap: Record<string, string> = {}
  if (isAdmin) {
    const employees = await listEmployeesWithNames(supabase, profile.org_id)
    employeeNameMap = Object.fromEntries(
      employees.map(e => [e.id, e.full_name || e.email || e.id.slice(0, 8)])
    )
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: t.text, margin: 0, letterSpacing: '-0.02em' }}>
          {locale === 'pt' ? 'RH & Controle de Horas' : 'HR & Time Management'}
        </h1>
        <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
          {locale === 'pt' ? 'Operações' : 'Operations'} › HR
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Left column: clock + week bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {employee ? (
            <>
              <ClockWidget activeEntry={activeEntry} locale={locale} />
              <div style={{ background: 'var(--surface)', border: `1px solid ${ink(0.1)}`, borderRadius: 12, padding: 20 }}>
                <WeekSummary entries={ownEntries} locale={locale} />
              </div>
            </>
          ) : (
            <div style={{
              background: 'var(--surface)', border: `1px solid ${ink(0.1)}`,
              borderRadius: 12, padding: 20, color: t.textMuted, fontSize: 13, lineHeight: 1.6,
            }}>
              <div style={{ fontWeight: 600, color: t.text, marginBottom: 6 }}>
                {locale === 'pt' ? 'Modo Administrador' : 'Administrator Mode'}
              </div>
              {locale === 'pt'
                ? 'Você não tem perfil de funcionário. Crie um para registrar suas próprias horas.'
                : 'You have no employee profile. Create one to track your own hours.'}
            </div>
          )}
        </div>

        {/* Right column: dashboard with tabs */}
        <HrDashboard
          entries={entries}
          employeeNameMap={employeeNameMap}
          employee={employee}
          hourlyRateCents={employee?.hourly_rate_in_cents ?? 0}
          locale={locale}
          isAdmin={isAdmin}
          weekLabel={weekLabel}
          weekStart={weekStart}
        />
      </div>
    </div>
  )
}
