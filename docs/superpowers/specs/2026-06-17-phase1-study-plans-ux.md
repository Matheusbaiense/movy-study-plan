# Phase 1 — study-plans UX Alignment (audit + spec)

> Date: 2026-06-17 · Branch: `design/woofed-ux-alignment`
> Method: ui-ux-pro-max checklist + design-critique lens, applied to all study-plans surfaces (read-only audit by 3 parallel agents). Adopts Phase-0 primitives in `@/components/ui`.

Goal: align the study-plans module to the woofed UX rubric using the new shared
primitives, **keeping** the editorial skin. ~59 findings across 3 surfaces; this
spec prioritizes them. The **public client-facing proposal** carries the highest
stakes and leads the priority order.

## Surface A — List + creation
`study-plans/page.tsx`, `NewProposalModal.tsx`, `ProposalsList.tsx`

| ID | Sev | Issue | Fix | Rubric |
|----|-----|-------|-----|--------|
| A-C1 | CRIT | `NewProposalModal` hand-rolled portal: no focus trap/Esc/scroll-lock/labelledby | Swap shell for `<Modal>` | 4,6 |
| A-C2 | CRIT | Icon action buttons lose focus ring; destructive Trash same size/no separation | focus-visible ring + separate Trash | 1 |
| A-H1 | HIGH | Page blocks on DB round-trip; no Suspense/Skeleton | Extract list → `<Suspense fallback={<ProposalsListSkeleton/>}>` | 5 |
| A-H2 | HIGH | Ad-hoc page header | adopt `<PageHeader>` | 2 |
| A-H3 | HIGH | Empty state inside `<td>`, no icon/CTA | `<EmptyState>` w/ CTA below table | 9 |
| A-H4 | HIGH | "Novo lead" raw label/input/select | `<Field>`+`<Input>`/`<Select>` | 6 |
| A-H5 | HIGH | Lead/Novo toggle not real tabs (aria) | role=tab/tabpanel or shared Tabs | 6 |
| A-H6 | HIGH | Hard-delete uses native `confirm()` | confirmation `<Modal>` | 4 |
| A-M1 | MED | Ativas/Lixeira not tabs; trash keeps stale filters | clear filters on view switch; `<Tabs>` | 3 |
| A-M2 | MED | Flash never auto-dismisses | 4s timeout | 8 |
| A-M3 | MED | Money column not tabular-nums | `fontVariantNumeric:'tabular-nums'` | 6 |
| A-M4 | MED | Timestamp 11px mono, low contrast dark | 12px body, brighter token | 6 |
| A-M5 | MED | `NewQuoteButton.tsx` dead/duplicated | delete or migrate to `<Button>` | 6 |
| A-M6 | MED | Search has no clear affordance | inline X clear button | 8 |
| A-M7 | MED | No surface-level Tabs (Ativas/Lixeira buried) | `<Tabs>` between header and toolbar | 3 |
| A-L1..L4 | LOW | hardcoded purple, count hidden single page, success uses purple not green, PT-only fallback | tokens/green/i18n | 6 |

## Surface B — Editor wizard
`StudyPlanEditor.tsx` (792) + editor subcomponents + `editor-ui.tsx`

| ID | Sev | Issue | Fix | Rubric |
|----|-----|-------|-----|--------|
| B-C1 | CRIT | No unsaved-changes guard (autosave 2.5s, no beforeunload/confirm) | `beforeunload` + confirm `<Modal>` on back | 4 |
| B-C2 | CRIT | `VersionHistory` inline toggle disrupts layout, no dialog semantics | convert to `<Drawer>` | 4 |
| B-H1 | HIGH | No skeletons on async (VersionHistory, CoursePortfolioPicker) | `<Skeleton>`/`<SkeletonText>` | 5 |
| B-H2 | HIGH | Inputs `outline:none`, no focus ring (incl. shared form.tsx) | add focus-visible ring to `controlStyle` | 1 |
| B-H3 | HIGH | Extra-cost/payment rows: no headers/labels on bare inputs | header row + `aria-label`/`<Field>` | 1 |
| B-H4 | HIGH | OptionsManager + EditorWizardNav duplicate pill-tab pattern | extract `PillTabBar` or controlled Tabs variant | 3,6 |
| B-H5 | HIGH | `editor-ui.tsx` Field/input/ghostButton duplicate `@/components/ui` | consolidate: import shared, keep editor-only bits | 6 |
| B-H6 | HIGH | Ad-hoc editor page header | adopt `<PageHeader>` | 2 |
| B-M1..M7 | MED | tabular-nums; restore double-click race; picker no click-outside; CourseList empty state; wizard nav not sticky; CTA style drift; ScenarioPanel dup labels | per-item | 3,6,9 |
| B-L1..L5 | LOW | autofocus per step; native progress; remove-row confirm; options grid mobile; heading hierarchy | per-item | 1 |

## Surface C — Proposal (internal + PUBLIC)
`StudyPlanProposal.tsx` (480), `[id]/proposal/page.tsx`, `p/[token]/page.tsx`, `PublicProposalPage.tsx`, `ShareProposalButton.tsx`

| ID | Sev | Tag | Issue | Fix | Rubric |
|----|-----|-----|-------|-----|--------|
| C-C1 | CRIT | PUBLIC | FX fetch leaves BRL prices blank → pop-in/CLS | inline `<Skeleton>` cells while fx null | 5,10 |
| C-C2 | CRIT | PUBLIC | Accept CTA invisible until scroll to bottom | top sticky/hero CTA prompt anchoring to AcceptBar | 4 |
| C-C3 | CRIT | PUBLIC | Leaks internal chrome ("Voltar ao editor", Print) to client | `isPublic` prop / split Document vs Shell | 2 |
| C-H1 | HIGH | PUBLIC | AcceptBar input label assoc broken; outline:none | `<Field>`+`<Input>` | 1 |
| C-H2 | HIGH | PUBLIC | Expired token → bare 404 | branded `<EmptyState>` expired page | 9 |
| C-H3 | HIGH | both | `ShareProposalButton` hand-rolled modal | `<Modal>`+`<Button loading>` | 4,6 |
| C-H4 | HIGH | INT | Toolbar hand-rolled buttons | `<Button>` variants | 6 |
| C-H5 | HIGH | PUBLIC | SummaryStrip fixed 4-col grid collapses on mobile | `repeat(auto-fit,minmax(140px,1fr))` | 5(layout) |
| C-H6 | HIGH | PUBLIC | OptionsComparison N-col grid → horizontal scroll mobile | `auto-fit minmax(220px,1fr)` | 5,7 |
| C-H7 | HIGH | PUBLIC | Accept checkbox tap target < 44px | enlarge + focus ring | 4 |
| C-H8 | HIGH | INT | Internal proposal page has no PageHeader | `<PageHeader>` w/ Share in actions | 2 |
| C-M1 | MED | both | Local color consts ignore theme → stuck light mode | import `t/color` tokens (enables dark) | 6 |
| C-M2..M8 | MED | mixed | lang attr; share loading skeleton; ✓ unicode icon; tabular-nums prices; expiry copy contradiction; small fonts <12px | per-item | 1,5,6 |
| C-L1..L5 | LOW | mixed | og:image; disabled contrast; timeline aria; accent card token; personalized greeting | per-item | 1,2 |

## Recommended implementation order

1. **Public proposal (customer-facing) — CRIT+HIGH:** C-C3, C-H5, C-H6, C-C2, C-C1, C-H1, C-H7, C-H2, C-M1. Highest brand stakes; clients open on phones via WhatsApp.
2. **Shared primitive adoption (high leverage, low risk):** A-C1, A-H2, B-H6, C-H8, C-H3, C-H4, B-H5 (consolidate editor-ui), B-C2 (VersionHistory→Drawer). Mostly shell swaps reusing Phase-0 work.
3. **Focus ring fix (one change, wide impact):** B-H2 / A-C2 / C-H1 — add focus-visible to shared `controlStyle` + icon buttons; fixes accessibility across the module at once.
4. **Safety/feedback:** B-C1 (unsaved guard), A-H6/L3 confirm modals, A-H1 Suspense+Skeleton, B-H1 skeletons.
5. **Polish (MED):** tabular-nums, empty states, auto-dismiss, search clear, sticky wizard nav.
6. **Defer (LOW):** og:image, heading hierarchy nits, etc. — batch later.

## Constraints
- No business-logic change. Editorial identity preserved (verify via screenshots).
- Each change reuses Phase-0 primitives; surgical diffs per file.
- Public proposal dark-mode is out of scope unless trivial (C-M1 enables it but verify it doesn't regress print).
