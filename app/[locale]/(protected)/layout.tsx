import { getUser } from '@/lib/auth/get-user'
import { AppShell } from '@/components/layout/AppShell'

interface ProtectedLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function ProtectedLayout({ children, params }: ProtectedLayoutProps) {
  const { locale } = await params
  const { profile } = await getUser(locale)

  return <AppShell profile={profile} locale={locale}>{children}</AppShell>
}
