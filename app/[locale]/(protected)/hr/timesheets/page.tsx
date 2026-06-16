import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TimesheetTable } from '@/components/hr/TimesheetTable'
import { listTimeEntries, listEmployeesWithNames, getEmployeeByProfileId, isHrAdmin } from '@/lib/hr'
import { t, font, ink } from '@/lib/ui/theme'

const PAGE_SIZE = 100

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string; employeeId?: string; page?: string }>
}

export default async function TimesheetsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { status, employeeId, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)
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

  const employee = isAdmin ? null : await getEmployeeByProfileId(supabase, profile.org_id, profile.id)

  const [entries, employees] = await Promise.all([
    listTimeEntries(supabase, profile.org_id, {
      status: status || undefined,
      employeeId: isAdmin ? (employeeId || undefined) : (employee?.id ?? '__none__'),
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    isAdmin ? listEmployeesWithNames(supabase, profile.org_id) : Promise.resolve([]),
  ])

  const statuses = ['pending', 'approved', 'rejected']

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 6 }}>
          {locale === 'pt' ? 'Operações' : 'Operations'} › {locale === 'pt' ? 'RH & Horas' : 'HR & Time'}
        </div>
        <h1 style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: t.text, margin: 0, letterSpacing: '-0.02em' }}>
          {locale === 'pt' ? 'Registros de Ponto' : 'Timesheets'}
        </h1>
        <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
          {isAdmin
            ? `${employees.length} ${locale === 'pt' ? 'funcionário(s)' : 'employee(s)'} · ${entries.length} ${locale === 'pt' ? 'registro(s)' : 'entr(ies)'}`
            : `${entries.length} ${locale === 'pt' ? 'registro(s) pessoais' : 'personal entr(ies)'}`}
        </div>
      </div>

      {/* Status filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <a href={`/${locale}/hr/timesheets`} style={{
          padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          background: !status ? '#4B1A77' : 'var(--surface)',
          color: !status ? '#fff' : t.textMuted,
          border: `1px solid ${ink(0.1)}`, textDecoration: 'none',
        }}>
          {locale === 'pt' ? 'Todos' : 'All'}
        </a>
        {statuses.map((s) => (
          <a
            key={s}
            href={`/${locale}/hr/timesheets?status=${s}${employeeId ? `&employeeId=${employeeId}` : ''}`}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: status === s ? '#4B1A77' : 'var(--surface)',
              color: status === s ? '#fff' : t.textMuted,
              border: `1px solid ${ink(0.1)}`, textDecoration: 'none', textTransform: 'capitalize',
            }}
          >
            {s}
          </a>
        ))}

        {/* Employee filter (if active, show a clear link) */}
        {employeeId && (
          <a
            href={`/${locale}/hr/timesheets${status ? `?status=${status}` : ''}`}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: 'var(--surface)', color: t.textMuted,
              border: `1px solid ${ink(0.15)}`, textDecoration: 'none',
            }}
          >
            {locale === 'pt' ? '× Limpar filtro' : '× Clear employee filter'}
          </a>
        )}
      </div>

      {/* Table */}
      {entries.length === 0 ? (
        <div style={{
          background: 'var(--surface)', border: `1px solid ${ink(0.1)}`, borderRadius: 12, padding: 24,
          textAlign: 'center', color: t.textMuted, fontSize: 14,
        }}>
          <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.4 }}>○</div>
          {isAdmin
            ? (locale === 'pt' ? 'Nenhuma entrada ainda. Aguarde seus funcionários lançarem horas.' : 'No entries yet. Wait for employees to log hours.')
            : (locale === 'pt' ? 'Você ainda não lançou horas. Use o botão \'Lançar Horas\' no dashboard para começar.' : "No entries yet. Use the 'Add Entry' button on the dashboard to get started.")}
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: `1px solid ${ink(0.1)}`, borderRadius: 12, padding: 24 }}>
          <TimesheetTable
            entries={entries}
            employees={isAdmin ? employees : []}
            hourlyRateCents={0}
            locale={locale}
            showEmployeeName={isAdmin}
          />
        </div>
      )}

      {/* Pagination */}
      {(page > 1 || entries.length === PAGE_SIZE) && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          {page > 1 && (
            <a
              href={`/${locale}/hr/timesheets?page=${page - 1}${status ? `&status=${status}` : ''}${employeeId ? `&employeeId=${employeeId}` : ''}`}
              style={{ padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: 'var(--surface)', color: t.textMuted, border: `1px solid ${ink(0.1)}`, textDecoration: 'none' }}
            >
              ← {locale === 'pt' ? 'Anterior' : 'Previous'}
            </a>
          )}
          <span style={{ padding: '6px 16px', fontSize: 13, color: t.textMuted }}>
            {locale === 'pt' ? `Página ${page}` : `Page ${page}`}
          </span>
          {entries.length === PAGE_SIZE && (
            <a
              href={`/${locale}/hr/timesheets?page=${page + 1}${status ? `&status=${status}` : ''}${employeeId ? `&employeeId=${employeeId}` : ''}`}
              style={{ padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: 'var(--surface)', color: t.textMuted, border: `1px solid ${ink(0.1)}`, textDecoration: 'none' }}
            >
              {locale === 'pt' ? 'Próxima' : 'Next'} →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
