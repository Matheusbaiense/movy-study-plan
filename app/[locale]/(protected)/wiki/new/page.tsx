import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { isEditorOrAbove } from '@/lib/permissions/can'
import { WikiForm } from '@/components/wiki/WikiForm'
import { PageHeader } from '@/components/ui/PageHeader'
import type { Tables } from '@/types/supabase'

interface WikiNewPageProps {
  params: Promise<{ locale: string }>
}

export default async function WikiNewPage({ params }: WikiNewPageProps) {
  const { locale } = await params
  const { profile } = await getUser(locale)

  if (!isEditorOrAbove(profile.role)) {
    redirect(`/${locale}/wiki`)
  }

  const supabase = await createClient()
  const { data: departments } = await supabase
    .from('departments')
    .select('id, slug, name_pt, name_en, name_es, icon, color')
    .eq('is_active', true)
    .order('name_pt')

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <PageHeader
        title={locale === 'en' ? 'New article' : 'Nova informação'}
        description={
          locale === 'en'
            ? 'Document a process, guide, or operational knowledge.'
            : 'Documente um processo, guia ou conhecimento operacional da Movy.'
        }
      />

      <WikiForm
        departments={(departments ?? []) as Tables<'departments'>[]}
        locale={locale}
      />
    </div>
  )
}
