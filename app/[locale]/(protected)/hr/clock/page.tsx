import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { ClockWidget } from '@/components/hr/ClockWidget'
import { getEmployeeByProfileId, getActiveClockEntry } from '@/lib/hr'
import { t, font } from '@/lib/ui/theme'

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
      <div style={{ padding: '48px 32px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 16, color: t.text }}>
          {locale === 'pt'
            ? 'Você não tem um perfil de funcionário ativo. Fale com o administrador.'
            : 'You do not have an active employee profile. Contact your administrator.'}
        </div>
      </div>
    )
  }

  const activeEntry = await getActiveClockEntry(supabase, employee.id)

  return (
    <div style={{ padding: '48px 32px', maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: t.text, marginBottom: 8, letterSpacing: '-0.02em' }}>
        {locale === 'pt' ? 'Bater Ponto' : 'Time Clock'}
      </h1>
      <p style={{ color: t.textMuted, fontSize: 13, marginBottom: 32 }}>
        {locale === 'pt' ? 'Registre sua entrada e saída do trabalho.' : 'Record your clock-in and clock-out.'}
      </p>
      <ClockWidget activeEntry={activeEntry} locale={locale} />
    </div>
  )
}
