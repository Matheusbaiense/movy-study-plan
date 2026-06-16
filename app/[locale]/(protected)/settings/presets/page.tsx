import { createServiceClient } from '@/lib/supabase/service'
import { getUser } from '@/lib/auth/get-user'
import { PresetsManager } from './PresetsManager'
import type { DbPreset } from '@/lib/study-plans/presets'

interface Props {
  params: Promise<{ locale: string }>
}

async function fetchPresets(): Promise<{ presets: DbPreset[]; serviceConfigured: boolean }> {
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from('course_presets')
      .select('*')
      .order('type', { ascending: true })
      .order('sort_order', { ascending: true })
    return { presets: (data ?? []) as unknown as DbPreset[], serviceConfigured: true }
  } catch {
    return { presets: [], serviceConfigured: false }
  }
}

export default async function PresetsPage({ params }: Props) {
  const { locale } = await params

  // The service-client catalog read is independent of the actor's profile,
  // so it overlaps with auth validation.
  const [, { presets, serviceConfigured }] = await Promise.all([
    getUser(locale),
    fetchPresets(),
  ])

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
