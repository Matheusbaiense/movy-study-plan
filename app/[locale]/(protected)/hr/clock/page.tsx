import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { ClockWidget } from '@/components/hr/ClockWidget'
import { getEmployeeByProfileId, getActiveClockEntry } from '@/lib/hr'
import { t } from '@/lib/ui/theme'
import { PageHeader, EmptyState } from '@/components/ui'
import { UserX } from 'lucide-react'

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
            ? 'Você não tem um perfil de funcionário ativo. Fale com o administrador.'
            : 'You do not have an active employee profile. Contact your administrator.'}
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
