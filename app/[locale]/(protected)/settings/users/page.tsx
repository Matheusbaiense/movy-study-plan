import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getUser } from '@/lib/auth/get-user'
import { isSuperAdmin } from '@/lib/permissions/can'
import { UsersManager, type UserRow, type AllowedRow } from './UsersManager'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function UsersPage({ params }: Props) {
  const { locale } = await params
  const { profile } = await getUser(locale)
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, created_at')
    .order('created_at', { ascending: false })

  if (!isSuperAdmin(profile.role)) {
    query = query.neq('role', 'super_admin')
  }

  const { data: users } = await query

  // allowed_emails has RLS with no select policy for authenticated users,
  // so read it with the service client (server-side only). Degrade gracefully
  // if SUPABASE_SERVICE_ROLE_KEY is not configured yet.
  let allowed: AllowedRow[] = []
  let serviceConfigured = true
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from('allowed_emails')
      .select('email, role')
      .order('email', { ascending: true })
    allowed = (data ?? []) as AllowedRow[]
  } catch {
    serviceConfigured = false
  }

  return (
    <UsersManager
      users={(users ?? []) as UserRow[]}
      allowed={allowed}
      actorRole={profile.role}
      actorId={profile.id}
      serviceConfigured={serviceConfigured}
    />
  )
}
