# Admissions Sector — Design Spec

> Status: **approved (design)** · Created 2026-06-18 · Branch `worktree-admissions-sector`
> Source data: `ADMISSIONS PER SCHOOL (2).xlsx` (29 sheets: 1 Summary + 28 schools, mostly Perth/WA)

## 1. Problem & Goal

The admissions team keeps a shared spreadsheet with one tab per partner school describing **how to enrol a student there**: enrolment type / portal login, the document checklist required for enrolment, handling notes, and the people to contact. Today this lives in a loose Excel file (with portal passwords in plain text, visible to anyone with the link).

**Goal:** bring this into the Movy hub as a first-class **Admissions** sector — a destination the admissions team browses by school — backed by structured data anchored to the existing Portfolio institutions, with portal credentials handled securely.

### Non-goals (YAGNI)

- No cross-school document filtering ("all schools that require GTE") yet — data shape allows it later.
- No new `admissions` role in the RBAC system.
- No translation of the operational content (it stays in English, like the spreadsheet).
- No workflow/automation tying admissions docs to a live student enrolment record (future).

## 2. Key Decisions (locked during brainstorming)

1. **Anchored to Portfolio.** Admissions is its own nav section, but each school's data links to the `institutions` row that already exists in Portfolio. One school = one record; no parallel school list.
2. **Structured fields**, not free-form rich text. `documents` and `contacts` are typed JSONB arrays; the rest are columns.
3. **Credentials in a separate table** (`school_admission_credentials`) — a deliberate security boundary. Password is masked by default; revealing it goes through a server action that writes an audit-log entry.
4. **Reveal allowed for editor+** (the admissions team uses the `editor` role and needs portal access daily). Still masked-by-default and audited.
5. **Seed all 28 schools** from the spreadsheet via an idempotent SQL migration, matching/creating institutions by name.
6. **Content editable by admin + editor**, readable by all active users — same pattern as Wiki/Portfolio.
7. All work in an **isolated worktree**, never on `main`.

## 3. Data Model

### 3.1 `school_admissions` (migration `024_admissions.sql`)

One row per school, anchored to an institution. Follows the column/RLS conventions of `institutions` (migration 011): `org_id` default org, `set_updated_at` trigger, soft-delete, `created_by`/`updated_by`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | `gen_random_uuid()` |
| `org_id` | uuid not null | default org, FK `organizations(id)` |
| `institution_id` | uuid not null | FK `institutions(id) on delete cascade` |
| `enrolment_type` | text | e.g. `"Direct entry (no package)"` |
| `portal_url` | text | optional |
| `streams` | text[] not null default `'{}'` | subset of `{english,vet,he}` (HE = higher-ed) |
| `documents` | jsonb not null default `'[]'` | array of `{ label: string, tags: string[], note?: string }` where tag ∈ `{all,visa,english,vet,he,package,couple}` |
| `contacts` | jsonb not null default `'[]'` | array of `{ name?: string, role?: string, email?: string, phone?: string }` (role ∈ `{admissions,marketing,comercial,other}`) |
| `notes` | text | the "Notes" block (multiline) |
| `metadata` | jsonb not null default `'{}'` | escape hatch for odd sheets |
| `created_by`/`updated_by` | uuid | FK `profiles(id) on delete set null` |
| `deleted_at` | timestamptz | soft delete |
| `created_at`/`updated_at` | timestamptz | trigger-maintained |

Indexes / constraints:
- `unique (org_id, institution_id) where deleted_at is null` — one admissions record per school.
- `index (org_id, institution_id)`.

RLS (mirrors `institutions`):
- **select**: `is_active_user() and org_id = current_org_id() and (deleted_at is null or role in (editor,admin,super_admin))`
- **insert/update**: `role in (editor,admin,super_admin) and org_id = current_org_id()`
- **delete**: `role in (admin,super_admin) and org_id = current_org_id()`

### 3.2 `school_admission_credentials` (same migration)

Separate table = separate access boundary, and keeps the secret out of the bulk list/detail query (it's only fetched on an explicit reveal).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `org_id` | uuid not null | default org |
| `admission_id` | uuid not null | FK `school_admissions(id) on delete cascade`, **unique** |
| `login` | text | |
| `password` | text | stored as-is (see §7 security note) |
| `label` | text | optional, e.g. "MovyPERTH portal" |
| `created_by`/`updated_by`/timestamps | | |

RLS:
- **select / insert / update**: `role in (editor,admin,super_admin) and org_id = current_org_id()` (editor+ per decision #4).
- **delete**: `role in (admin,super_admin)`.

> The security value here is: (a) the password is never returned by the list/detail queries — only by the dedicated reveal action; (b) revealing is audited; (c) the table is a clear, isolated place to later swap plaintext for app-level encryption (§7).

## 4. Server Layer (`lib/admissions/` + route `actions.ts`)

Follows the established seam pattern (`lib/portfolio`, `lib/hr`): pure types + org-scoped query helpers, with thin server actions calling them via `requireActor`/`requireEditor` from `lib/actions/auth`.

- `lib/admissions/types.ts` — table aliases + `AdmissionDocument`, `AdmissionContact` shapes; `SchoolAdmissionView` (admission joined with institution name/country/logo).
- `lib/admissions/queries.ts` — `listAdmissions()` (join institutions, no credentials), `getAdmissionByInstitution(id)`, `getAdmissionById(id)`, `upsertAdmission(...)`, `softDeleteAdmission(id)`; `getCredentialMeta(admissionId)` (returns `{ hasPassword, login }`, **never** the password), `revealCredential(admissionId)` (returns password), `upsertCredential(...)`.
- `app/[locale]/(protected)/admissions/actions.ts` — `upsertAdmissionAction`, `deleteAdmissionAction`, `upsertCredentialAction` (all `requireEditor`), and `revealPortalPasswordAction(admissionId)` which:
  1. `requireEditor()`,
  2. fetches the password via query helper,
  3. writes audit via `logAuditWithClient` (`kind: 'admissions_portal_revealed'`, target = institution),
  4. returns `{ password }`.

JSONB read/write goes through the existing `lib/db/json.ts` boundary (`toJson`/`fromJson`).

## 5. UI

Reuses `components/ui/` primitives (`PageHeader`, `EmptyState`, `Modal`, `Field/Input/Textarea/Select`, `Button`, `Tabs`, `Skeleton`) and the Wiki block visual language (`ChecklistBlock`, `InfoBox`) for the read view. Bilingual chrome (pt/en) like the rest of the app; operational content stays in English.

### 5.1 Nav
New entry **Admissions** in `AppShell` `mainNav`, near Portfólio (Lucide icon e.g. `GraduationCap` or `ClipboardCheck`). Route group `app/[locale]/(protected)/admissions/`.

### 5.2 List — `/admissions`
Server page. Grid/list of schools that have an admissions record, with search (by school name). Each card: school name + country flag, enrolment-type line, stream chips (English / VET / HE), contact count, a lock icon if a portal credential exists. `EmptyState` when none. Editor+ sees an "Add school" action that picks an institution without an admissions record yet (or creates the institution).

### 5.3 Detail — `/admissions/[id]`
Server page (`[id]` = `school_admissions.id`). Header: school name, link out to the Portfolio institution, status. Sections:
- **Enrolment & Portal** — enrolment type, portal URL, `login` shown, password rendered as `••••••` with a **Reveal** button (editor+) that calls `revealPortalPasswordAction` and shows it transiently (with a copy button). Reveal is audited.
- **Documents** — checklist grouped by stream/tag, rendered in the `ChecklistBlock`/`InfoBox` visual style (read-only checkboxes are display-only here; this is reference material, not per-student state).
- **Notes** — `InfoBox`.
- **Contacts** — list of `{ name, role, email (mailto), phone }`.

Edit mode (editor+) is a structured form (`Modal` or inline) with repeatable rows for documents and contacts, plus a separate credentials sub-form. `loading.tsx` skeleton for both pages.

## 6. Seeding (migration `025_admissions_seed.sql`)

Generated from the spreadsheet by a **build-time parser script** (`scripts/parse-admissions-xlsx.mjs`, not shipped at runtime) that reads the xlsx and emits idempotent SQL:

- For each of the 28 school sheets: resolve the institution by `lower(name)` against `institutions`; if missing, `insert ... on conflict do nothing` a minimal institution (name, country=Australia, source='admissions-seed').
- `insert into school_admissions (...) on conflict (org_id, institution_id) do update set ...` populating enrolment_type, streams, documents, contacts, notes.
- `insert into school_admission_credentials (...) on conflict (admission_id) do update ...` for sheets that carry login/password.

The migration is idempotent and reviewable in the PR (per `docs/MIGRATIONS.md`). Sheets with irregular layouts are normalized by hand in the script before generating SQL; a short mapping report (matched / created-institution / no-credentials) is included in the PR description.

The 28 source sheets: Academies Aus, ACMI, AILFE, AIWT, APSI, Curtin College, Curtin University, ECU, EIT, Empyrean, Greenwich, ILSC/Greystone, Kaplan Business School, KCBT, Language Links, Lexis, Milner, Murdoch, Navitas, NIT, PICE, PCBT, Phoenix, Stanley, SAI (Skills Australia), Stotts, TAFE WA, WAIFS.

## 7. Security Notes

- **Portal passwords** are sensitive. v1 stores them as plaintext in `school_admission_credentials` (parity with today's spreadsheet, but access-controlled + masked + audited). The isolated table is the seam to later introduce app-level encryption (e.g., `pgcrypto` or a KMS-wrapped column) without touching callers — flagged as a follow-up, not in scope for v1.
- The password is **never** included in list/detail query projections; only `revealPortalPasswordAction` returns it, and only after `requireEditor()` + audit write.
- Contact emails/phones are business contacts (school staff), not student PII — stored normally.
- CSP / headers unchanged; no new external origins.

## 8. Testing

- **Unit (node:test, `tests/*.test.mts`)**: pure mappers/validators in `lib/admissions` — document/contact shape validation, stream/tag normalization, `getCredentialMeta` never leaks password. Target the project's existing test style; keep ≥ the module's logic covered.
- **RLS**: assert read-without-credentials vs reveal path (action-level test with mocked client, like `hr-queries.test.mts`).
- **Migration**: idempotency (run twice = no-op), seed row counts.
- Manual: list + detail render, reveal+audit, edit round-trip (verify via preview tools).

## 9. Build Order

1. Migration `024_admissions.sql` (2 tables + RLS + indexes + trigger).
2. `lib/admissions/` types + queries + barrel; unit tests for pure parts.
3. Route `actions.ts` (upserts + reveal w/ audit).
4. List page + card + EmptyState + loading skeleton.
5. Detail page (read sections) + reveal UI.
6. Edit forms (admission + credentials).
7. Nav entry in `AppShell`.
8. `scripts/parse-admissions-xlsx.mjs` → `025_admissions_seed.sql`; review mapping.
9. Tests green, lint clean, build; PR.
