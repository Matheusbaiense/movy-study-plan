import { getUser } from '@/lib/auth/get-user'
import { isAdminOrAbove } from '@/lib/permissions/can'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui'
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
    { href: `/${locale}/settings/presets`, label: 'Presets' },
    { href: `/${locale}/settings/audit-log`, label: 'Audit Log' },
  ]

  return (
    <div>
      <PageHeader
        eyebrow={locale === 'pt' ? 'Administração' : 'Administration'}
        title={locale === 'pt' ? 'Configurações' : 'Settings'}
      />
      <SettingsTabs tabs={tabs} />
      {children}
    </div>
  )
}
