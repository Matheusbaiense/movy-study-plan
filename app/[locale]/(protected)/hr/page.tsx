import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClockWidget } from '@/components/hr/ClockWidget'
import { WeekSummary } from '@/components/hr/WeekSummary'
import { TimesheetTable } from '@/components/hr/TimesheetTable'
import {
  getEmployeeByProfileId, getActiveClockEntry,
  listTimeEntries,
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

  const employee = await getEmployeeByProfileId(supabase, profile.org_id, profile.id)
  const activeEntry = employee ? await getActiveClockEntry(supabase, employee.id) : null

  // Get entries for this week (Mon–Sun, local date)
  const now = new Date()
  const dow = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  const pad = (n: number) => String(n).padStart(2, '0')
  const weekStart = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`

  const weekEntries = employee
    ? await listTimeEntries(supabase, profile.org_id, {
        employeeId: employee.id,
        from: weekStart,
      })
    : []

  const recentEntries = await listTimeEntries(supabase, profile.org_id, {})

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: t.text, margin: 0, letterSpacing: '-0.02em' }}>
          {locale === 'pt' ? 'RH & Controle de Horas' : 'HR & Time Management'}
        </h1>
        <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
          {locale === 'pt' ? 'Operações' : 'Operations'} › {locale === 'pt' ? 'RH & Horas' : 'HR & Time'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ClockWidget activeEntry={activeEntry} locale={locale} />

          {employee && (
            <div style={{ background: 'var(--surface)', border: `1px solid ${ink(0.1)}`, borderRadius: 12, padding: 20 }}>
              <WeekSummary entries={weekEntries} locale={locale} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { href: `/${locale}/hr/timesheets`, label: locale === 'pt' ? 'Ver Todos os Registros' : 'All Timesheets' },
              { href: `/${locale}/hr/invoices`, label: 'Invoices' },
            ].map((l) => (
              <Link key={l.href} href={l.href} prefetch={false} style={{
                display: 'block', padding: '10px 16px', borderRadius: 8,
                background: 'var(--surface)', border: `1px solid ${ink(0.1)}`,
                color: t.text, fontSize: 13, fontWeight: 500, textDecoration: 'none',
              }}>
                {l.label} →
              </Link>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: `1px solid ${ink(0.1)}`, borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 16 }}>
            {locale === 'pt' ? 'Registros Recentes' : 'Recent Entries'}
          </div>
          <TimesheetTable
            entries={recentEntries.slice(0, 20)}
            hourlyRateCents={employee?.hourly_rate_in_cents ?? 0}
            locale={locale}
          />
        </div>
      </div>
    </div>
  )
}
