import { getUser } from '@/lib/auth/get-user'
import { isAdminOrAbove } from '@/lib/permissions/can'
import { redirect } from 'next/navigation'
import { color, font } from '@/lib/ui/theme'
import { SettingsTabs } from './SettingsTabs'

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function SettingsLayout({ children, params }: Props) {
  const { locale } = await params
  const { profile } = await getUser(locale)
  if (!isAdminOrAbove(profile.role)) redirect(`/${locale}/home`)

  const tabs = [
    { href: `/${locale}/settings`, label: locale === 'pt' ? 'Visão geral' : 'Overview' },
    { href: `/${locale}/settings/users`, label: locale === 'pt' ? 'Usuários' : 'Users' },
    { href: `/${locale}/settings/audit-log`, label: 'Audit Log' },
  ]

  return (
    <div>
      <div className="movy-kicker">
        {locale === 'pt' ? 'Administração' : 'Administration'}
      </div>
      <h1 style={{ fontFamily: font.display, fontSize: 30, fontWeight: 800, letterSpacing: '-0.035em', color: color.purpleDeep, margin: '8px 0 18px' }}>
        {locale === 'pt' ? 'Configurações' : 'Settings'}
      </h1>
      <SettingsTabs tabs={tabs} />
      {children}
    </div>
  )
}
