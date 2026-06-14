import { createServiceClient } from '@/lib/supabase/service'
import { getUser } from '@/lib/auth/get-user'
import { PresetsManager } from './PresetsManager'
import type { DbPreset } from '@/lib/study-plans/presets'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function PresetsPage({ params }: Props) {
  const { locale } = await params
  await getUser(locale)

  let presets: DbPreset[] = []
  let serviceConfigured = true
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from('course_presets')
      .select('*')
      .order('type', { ascending: true })
      .order('sort_order', { ascending: true })
    presets = (data ?? []) as unknown as DbPreset[]
  } catch {
    serviceConfigured = false
  }

  return <PresetsManager presets={presets} serviceConfigured={serviceConfigured} />
}
