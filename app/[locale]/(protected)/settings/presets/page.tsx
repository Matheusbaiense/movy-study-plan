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

  return (
    <>
      {/* course_presets is the legacy manual catalog — the Portfolio module
          (Settings → Portfolio) is the normalised replacement. Remove this
          page once all study plans reference portfolio courses exclusively. */}
      <div style={{ margin: '16px 32px 0', padding: '10px 16px', borderRadius: 8, background: '#fef3c7', border: '1px solid #f59e0b', fontSize: 13, color: '#92400e' }}>
        <strong>⚠ Módulo legado:</strong> Cursos agora devem ser cadastrados em <a href={`/${locale}/portfolio`} style={{ color: '#92400e', fontWeight: 600 }}>Portfólio</a>. Esta página permanece ativa enquanto study plans antigos ainda referenciam presets.
      </div>
      <PresetsManager presets={presets} serviceConfigured={serviceConfigured} />
    </>
  )
}
