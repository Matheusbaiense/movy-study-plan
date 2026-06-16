# Woofed UX Alignment — Program Design

> Date: 2026-06-17
> Status: Approved direction (brainstorming) — pending plan
> Branch: `design/woofed-ux-alignment`

## Goal

Bring **woofed-crm's structural and UX patterns** to `movy-study-plan` across all
~28 screens, **without changing movy's visual identity** ("Editorial Movement" —
deep purple `#4B1A77` + gold `#FBB615`, Clash Display + Satoshi, hairline borders).

This is a **UX-pattern alignment**, not a visual reskin. Movy keeps its skin;
woofed lends its skeleton (consistent components, headers, overlays, states).

## Non-goals

- No migration to Flowbite/shadcn or to woofed's palette/CRM look.
- No change to data model, server actions, or business logic except where a UI
  change strictly requires it.
- No unrelated refactoring beyond what each touched screen needs.

## A) The Woofed UX Standard (rubric)

Extracted from woofed-crm source (`app/views/layouts/internal.html.erb`,
`layouts/shared/_sidebar.html.erb`, `components/navs/_nav_tabs.html.erb`,
`components/ui/*`, `components/{overlays,skeleton,form,...}`):

| # | Pattern | Evidence in woofed | Target in movy |
|---|---------|--------------------|----------------|
| 1 | Collapsible icon-rail **sidebar** (72↔200px), icon+label, selected state, search pinned top, settings pinned bottom | `_sidebar.html.erb` | Audit movy sidebar for collapse / selected / pinned search |
| 2 | **Contextual page header** per module (title + primary actions) | `_navbar_*` per resource | One `PageHeader` primitive, used by every module |
| 3 | **Tabbed sub-nav** (underline, clear selected) | `_nav_tabs.html.erb` | One `Tabs` primitive |
| 4 | **Overlay system**: modal + drawer, reusable & consistent | `turbo_frame :modal` / `:drawer` | `Modal` + `Drawer` primitives in `lib/ui` |
| 5 | **Loading skeletons** on every async surface | `components/skeleton/*` | `Skeleton` primitives + per-screen usage |
| 6 | **Single set of UI primitives** (button/input/select/textarea/combobox/input-group/spinner) via CVA | `components/ui/*` | Shared `lib/ui` primitives replacing ad-hoc inline styles |
| 7 | **List → detail**, focused detail can hide chrome | deal `show` hides sidebar | Apply to detail-heavy screens |
| 8 | **Faceted filters**, consistent | `components/filters` | One filter pattern |
| 9 | **Designed empty states** | empty partials | `EmptyState` primitive |
| 10 | **Charts/analytics** single standard | apexcharts | Confirm/standardize movy charts |
| 11 | **Numbered semantic token ramp** | `brand-palette-01..08` | Movy already has `lib/ui/theme.ts` ✓ (keep) |

Movy already satisfies #11. The work is #1–#10: consistency of structure,
components, and states — wearing movy's existing skin.

## B) Per-screen audit method

For each screen, a repeatable loop:

1. **Capture** real screenshot of the running app (openwolf `designqc` / preview).
2. **Critique** (read-only, parallel-safe):
   - `/design-critique` — usability, hierarchy, consistency.
   - `/ui-ux-pro-max` — review against rubric (A) + UX guideline set.
3. **Findings** — prioritized CRITICAL / HIGH / MEDIUM / LOW, mapped to rubric #.
4. **Implement** — serialized per approval (cost/risk control), reusing Phase-0 primitives.
5. **Verify** — new screenshot; confirm the finding is resolved and identity preserved.

Execution model (honoring `/multi-workflow` + multi-agent intent):
- **Audit fan-out** may run in parallel across a phase's screens (read-only critique).
- **Implementation** stays serialized within a phase, primitives-first.

## C) Phased order

- **Phase 0 — Foundation**: extract shared primitives into movy `lib/ui`:
  `PageHeader`, `Tabs`, `Modal`, `Drawer`, `EmptyState`, `Skeleton`, and the
  form/button/input/select primitives. Everything downstream reuses these.
- **Phase 1 — Core**: `study-plans` (list + 5-step editor wizard + proposal) — the
  product's heart and most complex surface.
- **Phase 2 — Dense**: `financial`, `hr` (dashboard, clock, team, timesheets, invoices),
  `portfolio`.
- **Phase 3 — High-visibility**: `dashboard`, `home`, `cambio`.
- **Phase 4 — Secondary**: `wiki`, `settings` (audit-log, presets, users), `departments`.

Each phase: spec slice → plan → implement → verify, with user sign-off between phases.

## Screen inventory (28)

```
(public)        login, p/[token], unauthorized, [locale], /
dashboard       dashboard
study-plans     index, [id], [id]/proposal
financial       financial
hr              index, clock, team, timesheets, invoices, invoices/[id]/print
portfolio       index, [institutionId]
cambio          cambio
departments     index, [slug]
wiki            index, [slug], [slug]/edit, new
settings        index, audit-log, presets, users
```

## Risks & mitigations

- **Identity drift** — every implementation step verifies the editorial skin is
  preserved (purple+gold, Clash/Satoshi, hairlines). Verification screenshot gate.
- **Inline-style → primitive churn** — Phase 0 lands primitives first so later
  phases are swaps, not rewrites. Keep diffs surgical per screen.
- **Scope creep** — no business-logic changes; rubric #1–#10 only.
- **Cost** — critique parallel, implementation serialized, phase gates.

## Success criteria

- All 28 screens share the same PageHeader/Tabs/Modal/Drawer/EmptyState/Skeleton/
  form primitives.
- No screen uses ad-hoc inline-style overlays or headers once its phase ships.
- Editorial identity unchanged (verified by before/after screenshots).
- Each phase reviewed and approved before the next begins.
