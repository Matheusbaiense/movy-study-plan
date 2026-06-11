# Frontend Refactor — "Editorial Movement"

Handover for the visual refactor of the Movy Internal Hub. Read this before touching
any UI. Goal: kill the generic "template" look and the inline-style drift, using the
design system that **already exists** but was being ignored.

> Companion docs: `docs/BRAND.md` (tokens), `docs/AI-HANDOVER.md` (project state).
> Hard rule: this is a **presentational** refactor. Do NOT touch quote/money/date logic,
> auth, RLS or Supabase queries. Only change how things look.

## The problem we're fixing

- The design system is defined (`app/globals.css` `:root` vars, `tailwind.config.ts`,
  `docs/BRAND.md`) but **pages hardcode hex/rgba in inline styles** → drift + flat,
  template-y UI (uniform card grids, no depth, no hierarchy, no motion).

## Design direction

**Editorial Movement** — the authenticated portal is the *light* counterpart of the
deep-purple login. Signature = the Movy **ascending staircase** motif (movement /
progress) + strong typographic hierarchy.

- **Surfaces:** white cards, radius 18, hairline lilac border (`--movy-line`), layered
  purple-tinted shadow. Use the `.movy-card` / `.movy-card--hover` utilities.
- **Atmosphere:** the app shell carries `.movy-atmosphere` (fixed gold↗ + purple↙ wash).
  Don't add competing page backgrounds.
- **Kickers:** Space Mono, uppercase, tracked — class `.movy-kicker`. The brand's label voice.
- **Display headings:** Outfit 800, big scale contrast, tight tracking (`-0.03em`..`-0.045em`).
- **Accent discipline:** gold = the one bright highlight; orange = warm CTA; purple =
  structure. Never rainbow everything.
- **Motion:** one orchestrated page-load via `.movy-stagger` (children fade up in
  sequence) + `.movy-card--hover` lift. Respects `prefers-reduced-motion`.

## Foundation (DONE — use these, don't reinvent)

| Asset | Where | Use |
|-------|-------|-----|
| Color/font/shadow/radius tokens | `lib/ui/theme.ts` | `import { color, ink, font, shadow, radius, roleColor, accentRamp }` instead of raw hex |
| Atmosphere + motion + card utils | `app/globals.css` | `.movy-atmosphere`, `.movy-card`, `.movy-card--hover`, `.movy-kicker`, `.movy-stagger`, `.movy-rise` |
| Refactored reference pages | `components/layout/AppShell.tsx`, `app/[locale]/(protected)/home/page.tsx` | Copy these patterns to other pages |

`ink(a)` → `rgba(28,18,51,a)` (text/borders). `purpleA(a)` → purple tint.
`font.display` Outfit, `font.body` Manrope, `font.mono` Space Mono.

## Page-by-page TODO

Apply the same patterns (kicker + display heading + `.movy-card` + stagger + hover-lift,
tokens not hex). Each item is independent and safe to do in isolation.

- [x] **`settings/users` (`UsersManager.tsx`)** — token colors + `.movy-card` surfaces.
- [x] **`settings/page.tsx` + `settings/layout.tsx`** — kicker+display header, gold
      active tabs (`SettingsTabs.tsx`), token cards.
- [x] **`wiki/page.tsx` + `WikiListItem.tsx`** — display header, mono meta, `.movy-card`
      list items (CSS hover, JS hover handlers removed).
- [x] **`departments/page.tsx` + `departments/[slug]/page.tsx`** — area-card language
      (accent rail, kicker, hover-lift) + display hero.
- [x] **`study-plans/page.tsx`** (list) — `.movy-card` table, mono dates, token pills.
- [ ] **`study-plans/[id]` editor (`StudyPlanEditor.tsx`)** — biggest file, NOT done.
      Restyle the shell, section headers (kickers), inputs and the **timeline** only.
      ⚠️ Do NOT change calculation/date logic. Re-run `node --test tests/study-financial.test.mjs` after.
- [ ] **`financial/FinancialCalculator.tsx`** — NOT done. Inputs + result card to tokens;
      result total as a display-scale number with gold accent. Has an inline CSS string via
      `dangerouslySetInnerHTML` — fold those values onto the tokens.
- [ ] **`components/departments/CategorySection.tsx`** — align cards with `.movy-card`.
- [ ] **`settings/audit-log/page.tsx`** — table to `.movy-card`, mono timestamps.
- [ ] **`login/page.tsx`** — already strong; optional input polish.
- [ ] **`unauthorized/page.tsx` + `error.tsx` + `loading.tsx`** — brand the edge states
      (the home `loading.tsx` skeletons should mirror the new card shapes).

## Known brand bug to fix

- `lib/constants/departments.ts`: the "Referencia" dept uses `accent: '#057570'` — that's
  **FYME teal**, which `docs/BRAND.md` forbids. Replace with a Movy token (e.g.
  `--movy-purple-mid #3A1560` or `--movy-gold`). `DEPT_ACCENT` is derived from this and is
  also used in `wiki/page.tsx`, so changing it propagates correctly.

## Acceptance criteria (per page)

- [ ] No new hardcoded hex — colors come from `lib/ui/theme.ts` or CSS vars.
- [ ] Cards use `.movy-card` (+ `.movy-card--hover` when clickable).
- [ ] One kicker + display heading per major section; clear scale contrast.
- [ ] Hover/focus states feel designed; keyboard focus visible.
- [ ] No layout shift / horizontal overflow at 320, 375, 768, 1024, 1440.
- [ ] `prefers-reduced-motion` disables entrance/lift (handled by globals).

## QA (run in a temp clone OUTSIDE Google Drive — npm corrupts on the Drive path)

```
npm run type-check
npm run build
node --test tests/study-financial.test.mjs   # only if you touched study-plans
```

Existing verified clone: `C:\Users\baien\AppData\Local\Codex\movy-study-plan-verify-quote`.

## Deploy

Vercel uses **GitHub git-integration**: pushing `main` auto-builds a Production deploy.
Push a feature branch first to get a **preview URL** for visual review before merging.

## Log

### 2026-06-11 — Brand-aligned pass (source of truth: Movy Brand Guide 2026)
- **Real sail mark** (`components/brand/BrandDefs.tsx` + `MovyMark.tsx`) — the "sail in
  motion" (purple wing + gold sail). Defs rendered once in `app/layout.tsx`; consumed via
  `<use href="#movySymColor|Mono">`. Replaced the old 3-bar mark in shell + login; used as
  ghost watermark on dark panels. **Do not reintroduce the 3-bar mark.**
- **Type reverted to Outfit** (Brand Guide mandates Outfit display + Manrope body + Space
  Mono labels). Bricolage removed — it was off-brand.
- **Kicker = Space Mono, orange (light) / gold (dark), wide tracking** (`.movy-kicker`
  default orange; `.movy-kicker--gold` for dark). Drop inline kicker colors so they inherit.
- **IA priority**: Home leads with Proposta + Capacidade Financeira; CRM "em breve" teaser;
  **no knowledge/areas on Home** (wiki only via the menu icon). Home is first in the nav.
- **Shell bugs fixed**: inline `display:flex` was overriding Tailwind `hidden`/`lg:*`
  (hamburger showed on desktop, toggles dead). Responsive chrome fixed; avatar opens a real
  menu (profile + Settings + Sign out).
- **Data finishing**: PT/ES accents fixed in `departments.ts`; FYME teal accent removed.
- **Done**: foundation, Home, Shell, login, study-plans list, **StudyPlanEditor** (cards +
  orange kickers + flat timeline + ~20 accents; `node --test` 4/4 green), Financial
  calculator, Settings (layout/overview/users/**audit-log**), Wiki (list + **article
  detail**), Departments (list + detail + **CategorySection**), **unauthorized + error**.
- **Still TODO (minor)**: `StudyPlanProposal.tsx` (PDF — swap to the sail lockup),
  `components/wiki/WikiForm.tsx` + `wiki/new` + `wiki/[slug]/edit` (content-authoring form),
  `loading.tsx` skeletons (mirror the new card shapes), and a few residual accents
  (e.g. "Manha" timetable option — needs a label map to avoid changing the stored value).
- **Validation**: type-check green after every file; preview runs locally with an auth
  bypass (clone-only `MOVY_PREVIEW=1`). Branch `feat/frontend-editorial`, not yet promoted.

### 2026-06-11 — Foundation + Home + Shell + nav surfaces (earlier pass)
- Added `lib/ui/theme.ts` tokens; atmosphere/motion/card utilities in `app/globals.css`.
- `AppShell`: deep-purple gradient sidebar, gold active accent, staircase motif, atmosphere.
- `home/page.tsx`: editorial bento (dominant Proposta hero with motif + Informações),
  area cards with accent rail + featured cell, mono-dated recent list, staggered load.
- Settings (layout/overview/users + new `SettingsTabs`), Departments (list + detail hero),
  Wiki (header + `WikiListItem`), Study-Plans list — all converted to tokens + `.movy-card`.
- type-check + build green after every batch (clone `...verify-quote`).
- Branch: `feat/frontend-editorial` (commits 67b2200, bf1a2ae, 6624e05). NOT merged to
  main / NOT in production yet — pending user visual review.
- **Remaining (next agent):** StudyPlanEditor + FinancialCalculator (logic-heavy, restyle
  presentation only), CategorySection, audit-log, login polish, edge states. See TODO.
