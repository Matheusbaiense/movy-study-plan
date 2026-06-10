import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { isEditorOrAbove } from '@/lib/permissions/can'
import { WikiForm } from '@/components/wiki/WikiForm'
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Novo artigo Wiki</h1>
        <p className="mt-1 text-sm text-slate-500">
          Documente um processo, guia ou conhecimento operacional da Movy.
        </p>
      </div>

      <WikiForm
        departments={(departments ?? []) as Tables<'departments'>[]}
        locale={locale}
      />
    </div>
  )
}
