import type { CSSProperties } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { TimesheetTable } from '@/components/hr/TimesheetTable'
import { listTimeEntries, listEmployeesWithNames, getEmployeeByProfileId, isHrAdmin } from '@/lib/hr'
import { ink, color, t } from '@/lib/ui/theme'
import { PageHeader, EmptyState } from '@/components/ui'
import { buttonClass } from '@/components/ui/variants'
import { ClockIcon, Plus } from 'lucide-react'

const PAGE_SIZE = 100

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string; employeeId?: string; page?: string }>
}

export default async function TimesheetsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { status, employeeId, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)

  const [{ profile }, supabase] = await Promise.all([
    getUser(locale),
    createClient(),
  ])

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

  // Non-admins log hours via the HR dashboard modal; surface a CTA so this page
  // isn't a dead-end that just points elsewhere in prose.
  const logHoursCta = !isAdmin ? (
    <Link href={`/${locale}/hr`} className={buttonClass('primary')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
      <Plus size={14} aria-hidden="true" />
      {locale === 'pt' ? 'Lançar horas' : 'Log hours'}
    </Link>
  ) : null

  const filterPillStyle = (active: boolean): CSSProperties => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: active ? color.purple : 'var(--surface)',
    color: active ? '#fff' : 'var(--text-muted)',
    border: `1px solid ${active ? color.purple : ink(0.1)}`,
    textDecoration: 'none',
    textTransform: 'capitalize' as const,
  })

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <PageHeader
        eyebrow={`${locale === 'pt' ? 'Operações' : 'Operations'} › ${locale === 'pt' ? 'RH & Horas' : 'HR & Time'}`}
        title={locale === 'pt' ? 'Registros de Ponto' : 'Timesheets'}
        description={isAdmin
          ? `${employees.length} ${locale === 'pt' ? 'funcionário(s)' : 'employee(s)'} · ${entries.length} ${locale === 'pt' ? 'registro(s)' : 'entr(ies)'}`
          : `${entries.length} ${locale === 'pt' ? 'registro(s) pessoais' : 'personal entr(ies)'}`}
        actions={logHoursCta ?? undefined}
      />

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <a href={`/${locale}/hr/timesheets`} style={filterPillStyle(!status)}>
          {locale === 'pt' ? 'Todos' : 'All'}
        </a>
        {statuses.map((s) => (
          <a
            key={s}
            href={`/${locale}/hr/timesheets?status=${s}${employeeId ? `&employeeId=${employeeId}` : ''}`}
            style={filterPillStyle(status === s)}
          >
            {s}
          </a>
        ))}

        {/* Employee filter clear link */}
        {employeeId && (
          <a
            href={`/${locale}/hr/timesheets${status ? `?status=${status}` : ''}`}
            style={filterPillStyle(false)}
          >
            {locale === 'pt' ? '× Limpar filtro' : '× Clear employee filter'}
          </a>
        )}
      </div>

      {/* Table / empty state */}
      {entries.length === 0 ? (
        <EmptyState
          icon={ClockIcon}
          title={locale === 'pt' ? 'Nenhum registro encontrado' : 'No entries found'}
          description={isAdmin
            ? (locale === 'pt' ? 'Aguarde seus funcionários lançarem horas.' : 'Wait for employees to log hours.')
            : (locale === 'pt' ? 'Lance suas horas no dashboard de RH para começar.' : 'Log your hours on the HR dashboard to get started.')}
          action={logHoursCta ?? undefined}
        />
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
