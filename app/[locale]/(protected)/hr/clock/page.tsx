import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { ClockWidget } from '@/components/hr/ClockWidget'
import { getEmployeeByProfileId, getActiveClockEntry } from '@/lib/hr'
import { t } from '@/lib/ui/theme'
import { PageHeader, EmptyState } from '@/components/ui'
import { buttonClass } from '@/components/ui/variants'
import { UserX, ArrowRight } from 'lucide-react'

interface Props { params: Promise<{ locale: string }> }

export default async function ClockPage({ params }: Props) {
  const { locale } = await params
  const [{ profile }, supabase] = await Promise.all([
    getUser(locale),
    createClient(),
  ])

  const employee = await getEmployeeByProfileId(supabase, profile.org_id, profile.id)
  if (!employee) {
    return (
      <div style={{ padding: '48px 32px', maxWidth: 560, margin: '0 auto' }}>
        <EmptyState
          icon={UserX}
          title={locale === 'pt' ? 'Perfil de funcionário não encontrado' : 'No employee profile found'}
          description={locale === 'pt'
            ? 'Você ainda não tem um perfil de funcionário ativo. Abra o RH para ativá-lo, ou fale com o administrador.'
            : 'You do not have an active employee profile yet. Open HR to activate it, or contact your administrator.'}
          action={
            <Link href={`/${locale}/hr`} className={buttonClass('primary')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              {locale === 'pt' ? 'Ir para o RH' : 'Go to HR'}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          }
        />
      </div>
    )
  }

  const activeEntry = await getActiveClockEntry(supabase, employee.id)

  return (
    <div style={{ padding: '24px 32px', maxWidth: 560, margin: '0 auto' }}>
      <PageHeader
        title={locale === 'pt' ? 'Bater Ponto' : 'Time Clock'}
        description={locale === 'pt' ? 'Registre sua entrada e saída do trabalho.' : 'Record your clock-in and clock-out.'}
      />
      <ClockWidget activeEntry={activeEntry} locale={locale} />
    </div>
  )
}
