import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/get-user'
import { isEditorOrAbove } from '@/lib/permissions/can'
import { WikiForm } from '@/components/wiki/WikiForm'
import type { Tables } from '@/types/supabase'

interface WikiEditPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export default async function WikiEditPage({ params }: WikiEditPageProps) {
  const { locale, slug } = await params
  const { profile } = await getUser(locale)

  if (!isEditorOrAbove(profile.role)) {
    redirect(`/${locale}/wiki`)
  }

  const supabase = await createClient()

  const [{ data: content }, { data: departments }] = await Promise.all([
    supabase
      .from('contents')
      .select('*, departments(*)')
      .eq('slug', slug)
      .single(),
    supabase
      .from('departments')
      .select('id, slug, name_pt, name_en, name_es, icon, color')
      .eq('is_active', true)
      .order('name_pt'),
  ])

  if (!content) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Editar informacao</h1>
        <p className="mt-1 text-sm text-slate-500">
          Atualize o conteudo desta informacao.
        </p>
      </div>

      <WikiForm
        departments={(departments ?? []) as Tables<'departments'>[]}
        locale={locale}
        mode="edit"
        contentId={content.id}
        defaultValues={{
          title_pt: content.title_pt ?? undefined,
          title_en: content.title_en ?? undefined,
          title_es: content.title_es ?? undefined,
          body_pt: content.body_pt ?? undefined,
          body_en: content.body_en ?? undefined,
          body_es: content.body_es ?? undefined,
          department_id: content.department_id ?? undefined,
          tags: content.tags ?? undefined,
          status: content.status ?? undefined,
          is_featured: content.is_featured ?? false,
        }}
      />
    </div>
  )
}
