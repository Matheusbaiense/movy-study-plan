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

## Page-by-page TODO (not yet done)

Apply the same patterns (kicker + display heading + `.movy-card` + stagger + hover-lift,
tokens not hex). Each item is independent and safe to do in isolation.

1. **`settings/users` (`UsersManager.tsx`)** — already functional; restyle cards/table to
   `.movy-card`, kickers, token colors. Keep all server-action logic untouched.
2. **`settings/page.tsx` + `settings/layout.tsx`** — profile/stats cards → `.movy-card`;
   tab nav → underline-on-active with gold; kicker headers.
3. **`wiki/page.tsx`** — search/filter bar and list: lift to `.movy-card`, mono meta,
   featured-first list. The `WikiListItem` component carries most of the styling.
4. **`departments/page.tsx` + `departments/[slug]/page.tsx`** — same area-card language as
   Home (left accent rail, kicker pillar, hover-lift).
5. **`study-plans/page.tsx`** (list) — proposal rows as `.movy-card--hover`, status pills.
6. **`study-plans/[id]` editor (`StudyPlanEditor.tsx`)** — biggest file. Restyle the
   shell, section headers (kickers), inputs and the **timeline** only. ⚠️ Do NOT change
   calculation/date logic. Re-run `node --test tests/study-financial.test.mjs` after.
7. **`financial/FinancialCalculator.tsx`** — inputs + result card to tokens; result total
   as a display-scale number with gold accent.
8. **`login/page.tsx`** — already strong; optionally align inputs with `.movy-card` tone.
9. **`unauthorized/page.tsx` + `error.tsx` + `loading.tsx`** — brand the empty/edge states.

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

### 2026-06-11 — Foundation + Home + Shell (this pass)
- Added `lib/ui/theme.ts` tokens; atmosphere/motion/card utilities in `app/globals.css`.
- `AppShell`: deep-purple gradient sidebar, gold active accent, staircase motif, atmosphere.
- `home/page.tsx`: editorial bento (dominant Proposta hero with motif + Informações),
  area cards with accent rail + featured cell, mono-dated recent list, staggered load.
- type-check + build green. Remaining pages tracked in the TODO above.
