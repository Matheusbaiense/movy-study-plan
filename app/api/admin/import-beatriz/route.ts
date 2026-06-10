import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import seed from '@/data/beatriz-sop-content.json'

export const dynamic = 'force-dynamic'

type SeedArea = {
  slug: string
  name: string
  color: string
  icon: string | null
  description: string
}

type SeedArticle = {
  departmentSlug: string
  slug: string
  title: string
  summary: string
  body: string
  type: string
  category: string
  readMinutes: number
  featured: boolean
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  if (url.searchParams.get('confirm') !== 'movy') {
    return NextResponse.json(
      { error: 'Add ?confirm=movy to run the Beatriz import.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, is_active')
    .eq('id', auth.user.id)
    .single()

  if (!profile?.is_active || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const areas = seed.areas as SeedArea[]
  const articles = seed.articles as SeedArticle[]
  const allowedSlugs = areas.map((area) => area.slug)

  const departments = areas.map((area) => ({
    slug: area.slug,
    name_pt: area.name,
    name_en: area.name,
    name_es: area.name,
    color: area.color,
    icon: area.icon,
    is_active: true,
    description_pt: area.description,
    description_en: area.description,
    description_es: area.description,
  }))

  const { error: deptUpsertError } = await supabase
    .from('departments')
    .upsert(departments, { onConflict: 'slug' })

  if (deptUpsertError) {
    return NextResponse.json({ error: deptUpsertError.message }, { status: 500 })
  }

  const inList = `(${allowedSlugs.map((slug) => `"${slug}"`).join(',')})`
  const { error: deptArchiveError } = await supabase
    .from('departments')
    .update({ is_active: false })
    .not('slug', 'in', inList)

  if (deptArchiveError) {
    return NextResponse.json({ error: deptArchiveError.message }, { status: 500 })
  }

  const { data: activeDepartments, error: deptReadError } = await supabase
    .from('departments')
    .select('id, slug')
    .in('slug', allowedSlugs)

  if (deptReadError) {
    return NextResponse.json({ error: deptReadError.message }, { status: 500 })
  }

  const departmentIds = new Map((activeDepartments ?? []).map((dept) => [dept.slug, dept.id]))

  const { error: archiveError } = await supabase
    .from('contents')
    .update({ status: 'archived' })
    .not('slug', 'like', 'beatriz-%')

  if (archiveError) {
    return NextResponse.json({ error: archiveError.message }, { status: 500 })
  }

  const contentRows = articles.map((article) => ({
    slug: article.slug,
    title_pt: article.title,
    title_en: article.title,
    title_es: article.title,
    body_pt: article.body,
    summary: article.summary,
    department_id: departmentIds.get(article.departmentSlug) ?? null,
    status: 'published' as const,
    tags: ['beatriz', 'movy', article.departmentSlug],
    content_type: article.type,
    category: article.category,
    visibility: 'internal',
    read_minutes: article.readMinutes,
    version: '2.1',
    is_featured: article.featured,
    updated_by: profile.id,
  }))

  const { error: contentError } = await supabase
    .from('contents')
    .upsert(contentRows, { onConflict: 'slug' })

  if (contentError) {
    return NextResponse.json({ error: contentError.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    departments: departments.length,
    articles: contentRows.length,
  })
}
