import fs from 'node:fs'
import path from 'node:path'

const SOURCE =
  'C:/Users/baien/Downloads/Movy Internal Hub-handoff/movy-internal-hub/project/uploads/legacy-sop-site.html'

const OUT = path.resolve('supabase/migrations/005_knowledge_movy_content.sql')
const JSON_OUT = path.resolve('data/knowledge-sop-content.json')
const DATA_IMAGE_DIR = path.resolve('data/imported')

let imageCounter = 0

const AREAS = {
  visao: {
    slug: 'visao-geral',
    name: 'Visao Geral',
    icon: null,
    color: '#4B1A77',
    description: 'Jornada do estudante, organograma, perfis de cliente e visao operacional criada pela equipe Movy.',
  },
  captacao: {
    slug: 'captacao-vendas',
    name: 'Captacao & Vendas',
    icon: null,
    color: '#F36B1C',
    description: 'Primeiro contato, qualificacao, proposta, admissoes e timeline comercial.',
  },
  vistos: {
    slug: 'vistos',
    name: 'Vistos',
    icon: null,
    color: '#FBB615',
    description: 'Processos de visto Subclass 500, documentacao, GS, aplicacao e formularios.',
  },
  nomenclaturas: {
    slug: 'nomenclaturas',
    name: 'Nomenclaturas',
    icon: null,
    color: '#5A4E72',
    description: 'Padroes de nomenclatura e organizacao de documentos no Drive.',
  },
  support: {
    slug: 'student-support',
    name: 'Student Support',
    icon: null,
    color: '#D23B2B',
    description: 'Pre-embarque, chegada, welcome session e suporte continuo ao estudante.',
  },
  processos: {
    slug: 'processos-ferramentas',
    name: 'Processos & Ferramentas',
    icon: null,
    color: '#3A1560',
    description: 'Refund, cancelamento, change of course, Monday, OSHC, CommBank e USI.',
  },
  rh: {
    slug: 'politicas-internas',
    name: 'Politicas Internas',
    icon: null,
    color: '#2A1153',
    description: 'Politicas internas obrigatorias para colaboradores.',
  },
  ref: {
    slug: 'links-recursos',
    name: 'Links & Recursos',
    icon: null,
    color: '#057570',
    description: 'Links uteis, recursos oficiais, intake dates e contatos internos.',
  },
  feedbacks: {
    slug: 'feedbacks',
    name: 'Feedbacks',
    icon: null,
    color: '#A63A50',
    description: 'Dashboard e analise de feedbacks de estudantes.',
  },
  atendimentos: {
    slug: 'atendimentos',
    name: 'Atendimentos',
    icon: null,
    color: '#7A4DB3',
    description: 'Base de atendimentos, indicadores e motivos de contato.',
  },
}

const TYPE_BY_AREA = {
  rh: 'policy',
  ref: 'reference',
  nomenclaturas: 'reference',
  feedbacks: 'reference',
  atendimentos: 'reference',
}

function rebrand(value) {
  return value
    .replace(/Movy/g, 'Movy')
    .replace(/Movy/g, 'Movy')
    .replace(/movy/g, 'movy')
    .replace(/@movy\.com\.au/g, '@movyeducation.com')
    .replace(/movy\.com\.au/g, 'movyeducation.com')
    .replace(/movycoach/gi, 'movyeducation')
}

function stripTags(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function findMatchingDiv(html, openIndex) {
  const tagRe = /<\/?div\b[^>]*>/gi
  tagRe.lastIndex = openIndex
  let depth = 0
  let match
  while ((match = tagRe.exec(html))) {
    if (match[0].startsWith('</')) {
      depth -= 1
      if (depth === 0) return tagRe.lastIndex
    } else {
      depth += 1
    }
  }
  return html.length
}

function extractDivInner(html, openIndex) {
  const openEnd = html.indexOf('>', openIndex)
  const closeEnd = findMatchingDiv(html, openIndex)
  return html.slice(openEnd + 1, closeEnd - '</div>'.length)
}

function writeDataImage(mime, base64) {
  imageCounter += 1
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg'
  const filename = `knowledge-sop-image-${imageCounter}.${ext}`
  fs.mkdirSync(DATA_IMAGE_DIR, { recursive: true })
  fs.writeFileSync(path.join(DATA_IMAGE_DIR, filename), Buffer.from(base64, 'base64'))
  return `/api/imported/${filename}`
}

function cleanHtml(value) {
  let html = value
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '')
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '')
  html = html.replace(/<link\b[^>]*>/gi, '')
  html = html.replace(/<canvas[\s\S]*?<\/canvas>/gi, '')
  html = html.replace(
    /<img\b([^>]*)src=["']data:([^;]+);base64,([^"']+)["']([^>]*)>/gi,
    (_match, before, mime, base64, after) => {
      const src = writeDataImage(mime, base64)
      const alt = `${before} ${after}`.match(/\balt=["']([^"']*)["']/i)?.[1] ?? 'Imagem importada do SOP Movy'
      return `<img src="${src}" alt="${rebrand(alt)}">`
    }
  )
  html = html.replace(/\s+on[a-z]+="[^"]*"/gi, '')
  html = html.replace(/\s+on[a-z]+='[^']*'/gi, '')
  html = html.replace(/\s+style="[^"]*"/gi, '')
  html = html.replace(/\s+style='[^']*'/gi, '')
  html = html.replace(/<button\b[^>]*>/gi, '<div>')
  html = html.replace(/<\/button>/gi, '</div>')
  html = html.replace(/\s+/g, ' ')
  html = html.replace(/>\s+</g, '><').trim()
  return `<div class="legacy-sop">${rebrand(html)}</div>`
}

function extractCards(pageHtml) {
  const starts = [...pageHtml.matchAll(/<div class="scard"/g)].map((m) => m.index)
  return starts.map((start) => {
    const cardHtml = pageHtml.slice(start, findMatchingDiv(pageHtml, start))
    const title = cardHtml.match(/<div class="scard-title">([\s\S]*?)<\/div>/i)?.[1]
    const subtitle = cardHtml.match(/<div class="scard-sub">([\s\S]*?)<\/div>/i)?.[1]
    const bodyStart = cardHtml.search(/<div class="scard-body"/i)
    const body =
      bodyStart >= 0
        ? extractDivInner(cardHtml, bodyStart)
        : cardHtml

    return {
      title: rebrand(stripTags(title ?? 'Documento')),
      subtitle: rebrand(stripTags(subtitle ?? '')),
      body: cleanHtml(body),
    }
  })
}

function extractPages(html) {
  const markers = [...html.matchAll(/<div class="page[^"]*" id="page-([^"]+)"/g)].map((m) => ({
    id: m[1],
    start: m.index,
  }))

  return markers.map((marker, index) => {
    const end = markers[index + 1]?.start ?? html.indexOf('</body>')
    return { id: marker.id, html: html.slice(marker.start, end) }
  })
}

function sqlString(value) {
  if (value == null) return 'null'
  return `$movy$${String(value).replace(/\$movy\$/g, '$ movy $')}$movy$`
}

function sqlArray(items) {
  return `ARRAY[${items.map((item) => sqlString(item)).join(', ')}]::text[]`
}

function contentType(areaId, title) {
  if (/faq|perguntas frequentes/i.test(title)) return 'faq'
  if (/checklist|recap/i.test(title)) return 'checklist'
  return TYPE_BY_AREA[areaId] ?? 'process'
}

function readMinutes(body) {
  const words = stripTags(body).split(/\s+/).filter(Boolean).length
  return Math.max(2, Math.min(25, Math.ceil(words / 220)))
}

const html = fs.readFileSync(SOURCE, 'utf8')
const pages = extractPages(html)
const articles = []

for (const page of pages) {
  const area = AREAS[page.id]
  if (!area) continue

  const cards = extractCards(page.html)
  if (cards.length) {
    cards.forEach((card, index) => {
      articles.push({
        areaId: page.id,
        departmentSlug: area.slug,
        slug: `knowledge-${area.slug}-${slugify(card.title || `documento-${index + 1}`)}`,
        title: card.title || area.name,
        summary: card.subtitle || area.description,
        body: card.body,
        type: contentType(page.id, card.title),
        category: area.name,
        readMinutes: readMinutes(card.body),
        featured: index === 0,
      })
    })
  } else {
    const title = rebrand(stripTags(page.html.match(/<div class="ph-title">([\s\S]*?)<\/div>/i)?.[1] ?? area.name))
    const subtitle = rebrand(stripTags(page.html.match(/<div class="ph-sub">([\s\S]*?)<\/div>/i)?.[1] ?? area.description))
    const bodyStart = page.html.search(/<div class="page-body"|<div id=/i)
    const body = bodyStart >= 0 ? extractDivInner(page.html, bodyStart) : page.html
    articles.push({
      areaId: page.id,
      departmentSlug: area.slug,
      slug: `knowledge-${area.slug}-${slugify(title)}`,
      title,
      summary: subtitle,
      body: cleanHtml(body),
      type: contentType(page.id, title),
      category: area.name,
      readMinutes: readMinutes(body),
      featured: true,
    })
  }
}

const areaValues = Object.values(AREAS)
  .map(
    (area) => `  (${sqlString(area.slug)}, ${sqlString(area.name)}, ${sqlString(area.name)}, ${sqlString(area.name)}, ${sqlString(area.color)}, ${sqlString(area.icon)}, true, ${sqlString(area.description)}, ${sqlString(area.description)}, ${sqlString(area.description)})`
  )
  .join(',\n')

const allowedSlugs = Object.values(AREAS).map((area) => area.slug)

const articleSql = articles
  .map(
    (article) => `insert into public.contents (
  slug, title_pt, title_en, title_es, body_pt, summary, department_id, status,
  tags, content_type, category, visibility, read_minutes, version, is_featured
)
select
  ${sqlString(article.slug)},
  ${sqlString(article.title)},
  ${sqlString(article.title)},
  ${sqlString(article.title)},
  ${sqlString(article.body)},
  ${sqlString(article.summary)},
  d.id,
  'published'::public.content_status,
  ${sqlArray(['knowledge', 'movy', article.departmentSlug])},
  ${sqlString(article.type)},
  ${sqlString(article.category)},
  'internal',
  ${article.readMinutes},
  '2.1',
  ${article.featured ? 'true' : 'false'}
from public.departments d
where d.slug = ${sqlString(article.departmentSlug)}
on conflict (slug) do update set
  title_pt = excluded.title_pt,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  body_pt = excluded.body_pt,
  summary = excluded.summary,
  department_id = excluded.department_id,
  status = 'published'::public.content_status,
  tags = excluded.tags,
  content_type = excluded.content_type,
  category = excluded.category,
  visibility = excluded.visibility,
  read_minutes = excluded.read_minutes,
  version = excluded.version,
  is_featured = excluded.is_featured,
  updated_at = now();`
  )
  .join('\n\n')

const sql = `-- Movy Internal Hub - Movy SOP content import.
-- Generated from legacy-sop-site.html. Rebranded from Movy to Movy.

insert into public.departments (
  slug, name_pt, name_en, name_es, color, icon, is_active,
  description_pt, description_en, description_es
)
values
${areaValues}
on conflict (slug) do update set
  name_pt = excluded.name_pt,
  name_en = excluded.name_en,
  name_es = excluded.name_es,
  color = excluded.color,
  icon = excluded.icon,
  is_active = true,
  description_pt = excluded.description_pt,
  description_en = excluded.description_en,
  description_es = excluded.description_es;

update public.departments
set is_active = false
where slug <> all (${sqlArray(allowedSlugs)});

update public.contents
set status = 'archived'::public.content_status,
    updated_at = now()
where slug not like 'knowledge-%';

${articleSql}
`

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, sql, 'utf8')
fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true })
fs.writeFileSync(
  JSON_OUT,
  JSON.stringify(
    {
      source: 'legacy-sop-site.html',
      generatedAt: new Date().toISOString(),
      areas: Object.values(AREAS),
      articles,
    },
    null,
    2
  ),
  'utf8'
)

console.log(`Generated ${OUT}`)
console.log(`Generated ${JSON_OUT}`)
console.log(`Areas: ${Object.keys(AREAS).length}`)
console.log(`Articles: ${articles.length}`)
for (const area of Object.values(AREAS)) {
  const count = articles.filter((article) => article.departmentSlug === area.slug).length
  console.log(`- ${area.slug}: ${count}`)
}
