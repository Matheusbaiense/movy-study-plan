'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { logAuditWithClient } from '@/lib/api/audit'
import { slugify } from '@/lib/slug'
import { sanitizeHtml } from '@/lib/security/sanitize-html'
import { requireEditor, requireAdmin } from '@/lib/actions/auth'
import type { Enums } from '@/types/supabase'

export async function createContent(locale: string, formData: FormData) {
  const { supabase, profile } = await requireEditor()

  const titlePt = formData.get('title_pt') as string
  const titleEn = (formData.get('title_en') as string) || null
  const titleEs = (formData.get('title_es') as string) || null
  const bodyPt = sanitizeHtml((formData.get('body_pt') as string) || '')
  const bodyEn = formData.get('body_en') ? sanitizeHtml(formData.get('body_en') as string) : null
  const bodyEs = formData.get('body_es') ? sanitizeHtml(formData.get('body_es') as string) : null
  const departmentId = (formData.get('department_id') as string) || null
  const tagsRaw = (formData.get('tags') as string) || ''
  const rawStatus = formData.get('status') as string
  const VALID_STATUSES = ['draft', 'published', 'archived'] as const
  const status: Enums<'content_status'> = VALID_STATUSES.includes(rawStatus as typeof VALID_STATUSES[number])
    ? (rawStatus as Enums<'content_status'>)
    : 'draft'
  const isFeatured = formData.get('is_featured') === 'true'

  if (!titlePt) throw new Error('Title (PT) is required')

  const baseSlug = slugify(titlePt)
  let slug = baseSlug
  let attempt = 0

  while (attempt < 10) {
    const { data: existing } = await supabase
      .from('contents')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!existing) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }
  if (attempt >= 10) {
    slug = `${baseSlug}-${Math.random().toString(16).slice(2, 8)}`
  }

  const tags = tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const { data: content, error } = await supabase
    .from('contents')
    .insert({
      org_id: profile.org_id,
      slug,
      title_pt: titlePt,
      title_en: titleEn,
      title_es: titleEs,
      body_pt: bodyPt,
      body_en: bodyEn,
      body_es: bodyEs,
      department_id: departmentId,
      tags: tags.length > 0 ? tags : null,
      status,
      is_featured: isFeatured,
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  if (!content) throw new Error('Failed to create content')

  await logAuditWithClient(supabase, {
    actorId: profile.id,
    actorEmail: profile.email,
    action: 'content.create',
    entityType: 'contents',
    entityId: content.id,
    metadata: { slug, title: titlePt, status },
  })

  revalidatePath('/[locale]/(protected)/wiki', 'page')
  redirect(`/${locale}/wiki/${slug}`)
}

export async function updateContent(id: string, formData: FormData) {
  const { supabase, profile } = await requireEditor()

  const titlePt = formData.get('title_pt') as string
  const titleEn = (formData.get('title_en') as string) || null
  const titleEs = (formData.get('title_es') as string) || null
  const bodyPt = sanitizeHtml((formData.get('body_pt') as string) || '')
  const bodyEn = formData.get('body_en') ? sanitizeHtml(formData.get('body_en') as string) : null
  const bodyEs = formData.get('body_es') ? sanitizeHtml(formData.get('body_es') as string) : null
  const departmentId = (formData.get('department_id') as string) || null
  const tagsRaw = (formData.get('tags') as string) || ''
  const rawStatus2 = formData.get('status') as string
  const VALID_STATUSES_2 = ['draft', 'published', 'archived'] as const
  const status: Enums<'content_status'> = VALID_STATUSES_2.includes(rawStatus2 as typeof VALID_STATUSES_2[number])
    ? (rawStatus2 as Enums<'content_status'>)
    : 'draft'
  const isFeatured = formData.get('is_featured') === 'true'

  const tags = tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const { data: updatedContent, error } = await supabase
    .from('contents')
    .update({
      title_pt: titlePt,
      title_en: titleEn,
      title_es: titleEs,
      body_pt: bodyPt,
      body_en: bodyEn,
      body_es: bodyEs,
      department_id: departmentId,
      tags: tags.length > 0 ? tags : null,
      status,
      is_featured: isFeatured,
      updated_by: profile.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('org_id', profile.org_id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  if (!updatedContent) throw new Error('Failed to update content')

  await logAuditWithClient(supabase, {
    actorId: profile.id,
    actorEmail: profile.email,
    action: 'content.update',
    entityType: 'contents',
    entityId: id,
    metadata: { title: titlePt, status },
  })

  revalidatePath('/[locale]/(protected)/wiki', 'page')
  revalidatePath(`/[locale]/(protected)/wiki/${updatedContent.slug}`, 'page')
}

export async function deleteContent(id: string, locale = 'pt') {
  const { supabase, profile } = await requireAdmin()

  const { error } = await supabase
    .from('contents')
    .delete()
    .eq('id', id)
    .eq('org_id', profile.org_id)

  if (error) throw new Error(error.message)

  await logAuditWithClient(supabase, {
    actorId: profile.id,
    actorEmail: profile.email,
    action: 'content.delete',
    entityType: 'contents',
    entityId: id,
  })

  revalidatePath('/[locale]/(protected)/wiki', 'page')
  redirect(`/${locale}/wiki`)
}
