import { getUser } from '@/lib/auth/get-user'
import { isAdminOrAbove } from '@/lib/permissions/can'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function SettingsLayout({ children, params }: Props) {
  const { locale } = await params
  const { profile } = await getUser(locale)
  if (!isAdminOrAbove(profile.role)) redirect(`/${locale}/home`)

  const navItems = [
    { href: `/${locale}/settings`, label: locale === 'pt' ? 'Visão geral' : 'Overview' },
    { href: `/${locale}/settings/users`, label: locale === 'pt' ? 'Usuários' : 'Users' },
    { href: `/${locale}/settings/audit-log`, label: locale === 'pt' ? 'Audit Log' : 'Audit Log' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#03182D', marginBottom: 20 }}>Settings</h1>
      <div style={{
        display: 'flex', gap: 6, marginBottom: 28,
        borderBottom: '1px solid rgba(3,24,45,0.1)', paddingBottom: 0,
      }}>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 500,
              color: 'rgba(3,24,45,0.7)', textDecoration: 'none',
              borderBottom: '2px solid transparent', marginBottom: -1,
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  )
}
