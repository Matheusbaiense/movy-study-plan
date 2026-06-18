// scripts/parse-admissions-xlsx.mjs — Build-time only (NOT shipped at runtime).
//
// Reads "ADMISSIONS PER SCHOOL (2).xlsx" (already unzipped to a dir) and emits
// an idempotent PL/pgSQL seed (supabase/migrations/025_admissions_seed.sql).
// Each school sheet → one institution (resolved by alias, created if missing) →
// one school_admissions row (+ credential when the sheet carries login/password).
//
// Heuristic extraction; irregular sheets are normalized via OVERRIDES below.
//
// Usage: node scripts/parse-admissions-xlsx.mjs <unzipped-xlsx-dir> [outFile]

import fs from 'node:fs'
import path from 'node:path'

const DIR = process.argv[2]
const OUT = process.argv[3] ?? 'supabase/migrations/025_admissions_seed.sql'
const ORG = '11111111-1111-4111-8111-111111111111'

if (!DIR) {
  console.error('usage: node scripts/parse-admissions-xlsx.mjs <unzipped-xlsx-dir> [outFile]')
  process.exit(1)
}

// --- shared strings + sheet reader ------------------------------------------
const ss = fs.readFileSync(path.join(DIR, 'xl/sharedStrings.xml'), 'utf8')
const strings = []
{
  const re = /<si>([\s\S]*?)<\/si>/g
  let m
  while ((m = re.exec(ss))) {
    let t = m[1].replace(/<rPh[\s\S]*?<\/rPh>/g, '')
    let txt = ''
    const tre = /<t[^>]*>([\s\S]*?)<\/t>/g
    let tm
    while ((tm = tre.exec(t))) txt += tm[1]
    txt = txt
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&#10;/g, '\n').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    strings.push(txt)
  }
}

function colNum(ref) {
  const s = ref.replace(/[0-9]+/g, '')
  let n = 0
  for (const c of s) n = n * 26 + (c.charCodeAt(0) - 64)
  return n
}

function readSheet(file) {
  const x = fs.readFileSync(path.join(DIR, 'xl/worksheets', file), 'utf8')
  const rows = {}
  const cellRe = /<c r="([A-Z]+\d+)"([^>]*)>([\s\S]*?)<\/c>/g
  let cm
  while ((cm = cellRe.exec(x))) {
    const ref = cm[1], attrs = cm[2], inner = cm[3]
    const row = parseInt(ref.match(/\d+/)[0])
    const col = colNum(ref)
    let val = ''
    const vm = inner.match(/<v>([\s\S]*?)<\/v>/)
    if (attrs.includes('t="s"') && vm) val = strings[parseInt(vm[1])] || ''
    else if (vm) val = vm[1]
    if (!rows[row]) rows[row] = {}
    rows[row][col] = String(val).trim()
  }
  // → array of row-strings (joined cells)
  return Object.keys(rows)
    .map(Number).sort((a, b) => a - b)
    .map((r) => Object.keys(rows[r]).map(Number).sort((a, b) => a - b).map((c) => rows[r][c]).filter(Boolean))
    .map((cells) => cells.join(' | '))
    .filter((line) => line && !/^\d+$/.test(line))
}

// --- workbook: sheet name → file --------------------------------------------
const wb = fs.readFileSync(path.join(DIR, 'xl/workbook.xml'), 'utf8')
const rels = fs.readFileSync(path.join(DIR, 'xl/_rels/workbook.xml.rels'), 'utf8')
const relMap = {}
{
  const re = /<Relationship Id="([^"]+)"[^>]*Target="worksheets\/([^"]+)"/g
  let m
  while ((m = re.exec(rels))) relMap[m[1]] = m[2]
}
const sheets = []
{
  const re = /<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g
  let m
  while ((m = re.exec(wb))) sheets.push({ name: m[1].trim(), file: relMap[m[2]] })
}

// --- alias: sheet name → canonical institution name (existing rows in DB) ----
const INSTITUTION_ALIAS = {
  'Curtin University': 'Curtin University',
  ECU: 'ECU',
  Greenwich: 'Greenwich College',
  ILSCGreystone: 'ILSC',
  'Kaplan Business School': 'Kaplan Business School',
  'Language Links': 'Language Links',
  Milner: 'Milner',
  Murdoch: 'Murdoch University',
  NIT: 'NIT Australia',
  Stanley: 'Stanley College',
}
// Schools with no existing institution get created under their cleaned sheet name.
const NAME_FIX = { SAI: 'Skills Australia Institute (SAI)', 'Academies Aus': 'Academies Australasia' }

// --- per-sheet extraction ----------------------------------------------------
const HEADERS = /^(DOCUMENTS FOR ENROLMENT|Documents|Notes?|Point of Contact|English|VET|All Visa$|All COEs$)/i
const isEmail = (s) => /\S+@\S+\.\S+/.test(s)
const isPhone = (s) => /^[+\d][\d\s()-]{6,}$/.test(s.replace(/\|/g, '').trim())

function extract(name, lines) {
  let enrolment = null, portalUrl = null, login = null, password = null
  const docs = [], contacts = [], notes = []
  let section = 'top'
  const cleanName = name.replace(/\s+/g, ' ').trim().toLowerCase()
  let sawTitle = false

  for (let raw of lines) {
    const line = raw.replace(/\s*\|\s*/g, ' ').trim()
    if (!line) continue
    const upper = line.toUpperCase()

    if (/^DOCUMENTS FOR ENROLMENT/i.test(line)) { section = 'docs'; continue }
    if (/^Notes?\b/i.test(line) && line.length < 12) { section = 'notes'; continue }
    if (/^Point of Contact/i.test(line)) { section = 'contacts'; continue }
    if (/^Application Portal/i.test(line)) continue

    // skip the sheet's own title line (school name), e.g. "CURTIN COLLEGE"
    if (!sawTitle && line.replace(/\s+/g, ' ').toLowerCase() === cleanName) { sawTitle = true; continue }

    // portal credentials (any section)
    const loginM = line.match(/(?:Login|User(?:name)?)\s*[-–:]\s*(.+)/i)
    if (loginM) { login = loginM[1].trim(); continue }
    const pwM = line.match(/(?:Senha|Password|Pass)\s*[-–:]\s*(.+)/i)
    if (pwM) { password = pwM[1].trim(); continue }
    const urlM = line.match(/https?:\/\/\S+/)
    if (urlM && !portalUrl) portalUrl = urlM[0]

    if (section === 'top' || section === 'docs') {
      if (!enrolment && /(DIRECT ENTRY|NO PACKAGE|ENTRY|PACKAGE)/i.test(upper) && !/DOCUMENTS/i.test(upper) && line.length < 60) {
        enrolment = line
        continue
      }
    }

    // Role-label lines (e.g. "Admissions Manager") imply the contacts block even
    // when the sheet has no "Point of Contact" header — switch + record.
    if (/(Manager|Coordinator|Officer|Advisor|Team)\b/i.test(line) && line.length < 50 && section !== 'notes') {
      section = 'contacts'
      const role = /admiss/i.test(line) ? 'admissions' : /marketing/i.test(line) ? 'marketing' : /comerc|commerc|sales/i.test(line) ? 'comercial' : undefined
      contacts.push({ name: line, role })
      continue
    }

    // documents: captured in the explicit docs section AND in the top section
    // for sheets that have no "DOCUMENTS FOR ENROLMENT" header (e.g. Curtin College).
    if (section === 'docs' || section === 'top') {
      if (HEADERS.test(line) || /^Application Portal/i.test(line)) continue
      if (isEmail(line) || isPhone(line)) continue
      if (/^(Login|Senha|Password|User)/i.test(line)) continue
      // guidance sentences are notes, not checklist items
      if (/\b(must be|may vary|please check|necessary|can be completed|have to be|needs? to|should be|it is necessary)\b/i.test(line)) {
        notes.push(line)
        continue
      }
      if (line.length > 2 && line.length < 220) docs.push(line)
    } else if (section === 'notes') {
      if (isEmail(line) || isPhone(line)) continue
      notes.push(line)
    } else if (section === 'contacts') {
      if (isEmail(line)) {
        const m = line.match(/\S+@\S+\.\S+/)
        if (contacts.length) contacts[contacts.length - 1].email = m[0]
        else contacts.push({ email: m[0] })
      } else if (isPhone(line)) {
        if (contacts.length) contacts[contacts.length - 1].phone = line
      } else if (line.length < 80) {
        const role = /admiss/i.test(line) ? 'admissions' : /marketing/i.test(line) ? 'marketing' : /comerc|commerc|sales/i.test(line) ? 'comercial' : undefined
        const cname = line.replace(/\((marketing|comercial|admissions?)\)/i, '').trim()
        contacts.push({ name: cname || undefined, role })
      }
    }
  }

  // streams inference
  const blob = lines.join(' ').toLowerCase()
  const streams = []
  if (/\benglish\b/.test(blob)) streams.push('english')
  if (/\bvet\b/.test(blob)) streams.push('vet')
  if (/degree|university|bachelor|higher|diploma of higher/.test(blob) || /university/i.test(name)) streams.push('he')
  if (streams.length === 0) streams.push('english')

  // tag inference per doc
  const documents = docs.map((label) => {
    const tags = []
    if (/visa/i.test(label)) tags.push('visa')
    if (/coe/i.test(label)) tags.push('all')
    if (/package|offer letter from english/i.test(label)) tags.push('package')
    if (/couple|family|marriage|birth certificate/i.test(label)) tags.push('couple')
    if (/english/i.test(label)) tags.push('english')
    return { label, tags }
  })

  // clean notes: collapse a phrase immediately repeated (merged Excel cells), dedupe lines
  const cleanNotes = []
  const seenNote = new Set()
  for (let n of notes) {
    n = n.replace(/(.{12,}?)(?:\s+\1)+/g, '$1').trim()
    if (n && !seenNote.has(n)) { seenNote.add(n); cleanNotes.push(n) }
  }

  // clean contacts: a "name" that is purely numeric/sci-notation is really a phone
  const cleanContacts = []
  for (const c of contacts) {
    if (c.name && /^[\d.\sE+()-]+$/i.test(c.name)) {
      if (!c.phone) c.phone = c.name
      c.name = undefined
    }
    if (c.name || c.email || c.phone) cleanContacts.push(c)
  }

  return { enrolment, portalUrl, login, password, documents, contacts: cleanContacts, notes: cleanNotes.join('\n') || null, streams }
}

// --- SQL emit ----------------------------------------------------------------
const q = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`)
const jsonb = (o) => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`
const arr = (a) => `array[${a.map((x) => `'${x}'`).join(',')}]::text[]`

let body = ''
const report = []
for (const sheet of sheets) {
  if (sheet.name === 'Summary') continue
  const lines = readSheet(sheet.file)
  const data = extract(sheet.name, lines)
  const inst = INSTITUTION_ALIAS[sheet.name] ?? NAME_FIX[sheet.name] ?? sheet.name.trim()
  report.push({ sheet: sheet.name, institution: inst, docs: data.documents.length, contacts: data.contacts.length, cred: !!(data.login || data.password) })

  body += `
  -- ${sheet.name} → ${inst}
  select id into v_inst from public.institutions where org_id = v_org and lower(name) = lower(${q(inst)}) and deleted_at is null limit 1;
  if v_inst is null then
    insert into public.institutions (org_id, name, country, source) values (v_org, ${q(inst)}, 'AU', 'admissions-seed') returning id into v_inst;
  end if;
  insert into public.school_admissions (org_id, institution_id, enrolment_type, portal_url, streams, documents, contacts, notes)
  values (v_org, v_inst, ${q(data.enrolment)}, ${q(data.portalUrl)}, ${arr(data.streams)}, ${jsonb(data.documents)}, ${jsonb(data.contacts)}, ${q(data.notes)})
  on conflict (org_id, institution_id) where deleted_at is null do update set
    enrolment_type = excluded.enrolment_type, portal_url = excluded.portal_url, streams = excluded.streams,
    documents = excluded.documents, contacts = excluded.contacts, notes = excluded.notes, updated_at = now()
  returning id into v_adm;
`
  // Portal credentials are intentionally NOT seeded — editors add them in-app.
}

// Rebrand: the source spreadsheet refers to the agency as "FYME"; the product is "Movy".
// Replace the agency name everywhere in the emitted prose (no credentials are seeded).
body = body.replace(/fyme/gi, 'Movy')

const sql = `-- 025_admissions_seed.sql — Seed of admissions instructions per school.
-- Generated from "ADMISSIONS PER SCHOOL (2).xlsx" by scripts/parse-admissions-xlsx.mjs.
-- Agency name normalized FYME → Movy; portal credentials are NOT seeded.
-- Idempotent: resolves/creates the institution, upserts the admissions record.
do $$
declare
  v_org  uuid := '${ORG}';
  v_inst uuid;
  v_adm  uuid;
begin
${body}
end $$;
`

fs.writeFileSync(OUT, sql, 'utf8')
console.error(JSON.stringify(report, null, 2))
console.error(`\nWrote ${OUT} (${sheets.length - 1} schools)`)
