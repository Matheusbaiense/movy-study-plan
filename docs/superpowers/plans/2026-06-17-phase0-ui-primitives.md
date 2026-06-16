# Phase 0 — Shared UI Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract a single, reusable set of UI primitives into `components/ui/` so every movy screen shares the same headers, tabs, overlays, states, and form controls — wearing movy's existing editorial skin.

**Architecture:** Each primitive is a small, focused `'use client'` component using inline styles + theme tokens from `@/lib/ui/theme` and existing global CSS classes (`button-fill-primary-md`, etc.). Branching logic (variant→class, tab active, skeleton geometry) is extracted into pure `.ts` helpers that are unit-tested with `node:test`. Components themselves are verified visually via a temporary preview gallery + screenshots (the repo's test harness does not transform JSX, so component rendering is screenshot-verified, not unit-tested).

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, lucide-react, node:test (`.mts`, `--experimental-strip-types`). No new dependencies.

---

## Conventions (read before starting)

- Branch is `design/woofed-ux-alignment`. **Never commit to `main`.**
- Components: `'use client'`, inline `style={{}}`, tokens from `@/lib/ui/theme` (`t`, `color`, `ink`, `font`, `radius`). Reuse global classes where they exist.
- Existing button classes (in `app/globals.css`): `button-fill-primary-md` (primary), `button-outline-secondary-md` (secondary), `button-blank-secondary-icon` (icon-only).
- Tests: pure helpers only, `tests/ui-*.test.mts`, run with `npm test`.
- Gates after every task: `npm run type-check` and `npm run lint` must pass.
- File-size rule: keep each primitive < 200 lines; one responsibility per file.

## File Structure

```
components/ui/
  variants.ts        # pure: buttonClass(variant) → className           (Task 1)
  Button.tsx         # Button (wraps existing button-* classes)         (Task 2)
  form.tsx           # Field, Input, Select, Textarea                   (Task 3)
  PageHeader.tsx     # eyebrow + title + description + actions slot     (Task 4)
  tabs-logic.ts      # pure: isTabActive(pathname, href)                (Task 5)
  Tabs.tsx           # underline tab bar                                (Task 5)
  EmptyState.tsx     # icon + title + description + optional action     (Task 6)
  skeleton-logic.ts  # pure: skeletonRows(count) → number[]             (Task 7)
  Skeleton.tsx       # Skeleton + SkeletonText                          (Task 7)
  Modal.tsx          # portal overlay, esc/outside-close, focus return  (Task 8)
  Drawer.tsx         # slide-in side panel (reuses overlay behaviour)   (Task 9)
  index.ts           # barrel export                                    (Task 10)
tests/
  ui-variants.test.mts
  ui-tabs-logic.test.mts
  ui-skeleton-logic.test.mts
app/globals.css      # add @keyframes movy-shimmer                      (Task 7)
app/[locale]/(protected)/_ui-preview/page.tsx   # temp gallery (flagged) (Task 11)
```

---

## Task 1: Button variant helper (pure, TDD)

**Files:**
- Create: `components/ui/variants.ts`
- Test: `tests/ui-variants.test.mts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/ui-variants.test.mts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buttonClass } from '../components/ui/variants.ts'

test('buttonClass maps primary to the fill class', () => {
  assert.equal(buttonClass('primary'), 'button-fill-primary-md')
})

test('buttonClass maps secondary to the outline class', () => {
  assert.equal(buttonClass('secondary'), 'button-outline-secondary-md')
})

test('buttonClass maps icon to the blank icon class', () => {
  assert.equal(buttonClass('icon'), 'button-blank-secondary-icon')
})

test('buttonClass defaults to secondary for unknown variant', () => {
  // @ts-expect-error testing runtime fallback
  assert.equal(buttonClass('nope'), 'button-outline-secondary-md')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../components/ui/variants.ts'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// components/ui/variants.ts
export type ButtonVariant = 'primary' | 'secondary' | 'icon'

const MAP: Record<ButtonVariant, string> = {
  primary: 'button-fill-primary-md',
  secondary: 'button-outline-secondary-md',
  icon: 'button-blank-secondary-icon',
}

export function buttonClass(variant: ButtonVariant): string {
  return MAP[variant] ?? MAP.secondary
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (4 ui-variants assertions green; existing suites unaffected).

- [ ] **Step 5: Type-check, lint, commit**

```bash
npm run type-check && npm run lint
git add components/ui/variants.ts tests/ui-variants.test.mts
git commit -m "feat(ui): add buttonClass variant helper"
```

---

## Task 2: Button component

**Files:**
- Create: `components/ui/Button.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/ui/Button.tsx
'use client'

import { forwardRef } from 'react'
import { buttonClass, type ButtonVariant } from './variants'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', loading = false, disabled, className, children, ...rest },
  ref,
) {
  const cls = [buttonClass(variant), className].filter(Boolean).join(' ')
  return (
    <button ref={ref} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {children}
    </button>
  )
})
```

- [ ] **Step 2: Type-check + lint**

Run: `npm run type-check && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/ui/Button.tsx
git commit -m "feat(ui): add Button primitive over existing button-* classes"
```

---

## Task 3: Form primitives (Field, Input, Select, Textarea)

**Files:**
- Create: `components/ui/form.tsx`

These consolidate the ad-hoc `input`/`Field` from `components/study-plans/editor-ui.tsx` into shared, typed controls. Visual parity with the existing `input` style object is intentional.

- [ ] **Step 1: Write the components**

```tsx
// components/ui/form.tsx
'use client'

import { forwardRef } from 'react'
import { t } from '@/lib/ui/theme'

const controlStyle: React.CSSProperties = {
  width: '100%',
  border: `1px solid ${t.border}`,
  borderRadius: 9,
  padding: '10px 11px',
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: t.text,
  background: t.surface,
  outline: 'none',
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11, color: t.textSubtle }}>{hint}</span>}
    </label>
  )
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ style, ...rest }, ref) {
    return <input ref={ref} style={{ ...controlStyle, ...style }} {...rest} />
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ style, ...rest }, ref) {
    return <textarea ref={ref} style={{ ...controlStyle, resize: 'vertical', minHeight: 80, ...style }} {...rest} />
  },
)

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ style, children, ...rest }, ref) {
    return (
      <select ref={ref} style={{ ...controlStyle, cursor: 'pointer', ...style }} {...rest}>
        {children}
      </select>
    )
  },
)
```

- [ ] **Step 2: Type-check + lint**

Run: `npm run type-check && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/ui/form.tsx
git commit -m "feat(ui): add Field/Input/Select/Textarea form primitives"
```

---

## Task 4: PageHeader (#2 contextual header)

**Files:**
- Create: `components/ui/PageHeader.tsx`

Standardizes the per-screen header: optional eyebrow (kicker), title (display font), optional description, and a right-aligned actions slot.

- [ ] **Step 1: Write the component**

```tsx
// components/ui/PageHeader.tsx
'use client'

import { font, t } from '@/lib/ui/theme'

interface PageHeaderProps {
  title: string
  eyebrow?: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, eyebrow, description, actions }: PageHeaderProps) {
  return (
    <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && <div className="movy-kicker" style={{ marginBottom: 8 }}>{eyebrow}</div>}
        <h1 className="movy-display" style={{ margin: 0, fontSize: 'clamp(1.6rem, 1.2rem + 1.4vw, 2.2rem)', color: t.text }}>
          {title}
        </h1>
        {description && (
          <p style={{ margin: '8px 0 0', maxWidth: 560, color: t.textMuted, fontFamily: font.body, fontSize: 14, lineHeight: 1.5 }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>{actions}</div>}
    </header>
  )
}
```

- [ ] **Step 2: Type-check + lint**

Run: `npm run type-check && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/ui/PageHeader.tsx
git commit -m "feat(ui): add PageHeader primitive"
```

---

## Task 5: Tabs (#3) with pure active-state helper (TDD)

**Files:**
- Create: `components/ui/tabs-logic.ts`
- Create: `components/ui/Tabs.tsx`
- Test: `tests/ui-tabs-logic.test.mts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/ui-tabs-logic.test.mts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isTabActive } from '../components/ui/tabs-logic.ts'

test('isTabActive is true on exact match', () => {
  assert.equal(isTabActive('/en/settings/users', '/en/settings/users'), true)
})

test('isTabActive is true when pathname is a sub-route of the tab', () => {
  assert.equal(isTabActive('/en/settings/users/42', '/en/settings/users'), true)
})

test('isTabActive is false for a sibling tab', () => {
  assert.equal(isTabActive('/en/settings/users', '/en/settings/presets'), false)
})

test('isTabActive does not match on partial segment', () => {
  assert.equal(isTabActive('/en/settings/users-archive', '/en/settings/users'), false)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the helper**

```ts
// components/ui/tabs-logic.ts
export function isTabActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Write the Tabs component**

```tsx
// components/ui/Tabs.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { t } from '@/lib/ui/theme'
import { isTabActive } from './tabs-logic'

export interface TabItem {
  label: string
  href: string
}

export function Tabs({ items }: { items: TabItem[] }) {
  const pathname = usePathname()
  return (
    <nav style={{ borderBottom: `1px solid ${t.border}`, marginBottom: 24 }}>
      <ul style={{ display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0, overflowX: 'auto' }}>
        {items.map((tab) => {
          const active = isTabActive(pathname, tab.href)
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                prefetch={false}
                aria-current={active ? 'page' : undefined}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 40,
                  padding: '0 18px',
                  marginBottom: -1,
                  borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                  color: active ? t.text : t.textMuted,
                  fontFamily: 'var(--font-body)',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 6: Type-check, lint, commit**

```bash
npm run type-check && npm run lint
git add components/ui/tabs-logic.ts components/ui/Tabs.tsx tests/ui-tabs-logic.test.mts
git commit -m "feat(ui): add Tabs primitive with active-state helper"
```

---

## Task 6: EmptyState (#9)

**Files:**
- Create: `components/ui/EmptyState.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/ui/EmptyState.tsx
'use client'

import type { LucideIcon } from 'lucide-react'
import { ink, t, font } from '@/lib/ui/theme'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="movy-card"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, padding: '48px 24px' }}
    >
      <span
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 999, background: ink(0.05), color: 'var(--accent)' }}
      >
        <Icon size={24} strokeWidth={1.6} />
      </span>
      <h3 style={{ margin: 0, fontFamily: font.display, fontSize: 17, color: t.text }}>{title}</h3>
      {description && <p style={{ margin: 0, maxWidth: 380, color: t.textMuted, fontFamily: font.body, fontSize: 13, lineHeight: 1.5 }}>{description}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}
```

- [ ] **Step 2: Type-check + lint**

Run: `npm run type-check && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/ui/EmptyState.tsx
git commit -m "feat(ui): add EmptyState primitive"
```

---

## Task 7: Skeleton (#5) + shimmer keyframe (TDD helper)

**Files:**
- Modify: `app/globals.css` (append shimmer keyframe + class)
- Create: `components/ui/skeleton-logic.ts`
- Create: `components/ui/Skeleton.tsx`
- Test: `tests/ui-skeleton-logic.test.mts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/ui-skeleton-logic.test.mts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { skeletonRows } from '../components/ui/skeleton-logic.ts'

test('skeletonRows returns an array of the requested length', () => {
  assert.deepEqual(skeletonRows(3), [0, 1, 2])
})

test('skeletonRows clamps to at least 1', () => {
  assert.deepEqual(skeletonRows(0), [0])
})

test('skeletonRows clamps negatives to 1', () => {
  assert.deepEqual(skeletonRows(-5), [0])
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the helper**

```ts
// components/ui/skeleton-logic.ts
export function skeletonRows(count: number): number[] {
  const n = Math.max(1, Math.floor(count))
  return Array.from({ length: n }, (_, i) => i)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Append shimmer keyframe to globals.css**

Append to the end of `app/globals.css`:

```css
/* Skeleton shimmer — used by components/ui/Skeleton.tsx */
@keyframes movy-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.movy-skeleton {
  background: linear-gradient(90deg, var(--surface-sunken) 25%, var(--surface-raised) 37%, var(--surface-sunken) 63%);
  background-size: 200% 100%;
  animation: movy-shimmer 1.4s ease-in-out infinite;
  border-radius: 8px;
}
@media (prefers-reduced-motion: reduce) {
  .movy-skeleton { animation: none; }
}
```

- [ ] **Step 6: Write the Skeleton component**

```tsx
// components/ui/Skeleton.tsx
'use client'

import { skeletonRows } from './skeleton-logic'

export function Skeleton({ width = '100%', height = 14, style }: { width?: number | string; height?: number | string; style?: React.CSSProperties }) {
  return <div className="movy-skeleton" style={{ width, height, ...style }} aria-hidden="true" />
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: 'grid', gap: 8 }} aria-hidden="true">
      {skeletonRows(lines).map((i, idx, arr) => (
        <Skeleton key={i} width={idx === arr.length - 1 ? '60%' : '100%'} />
      ))}
    </div>
  )
}
```

- [ ] **Step 7: Type-check, lint, commit**

```bash
npm run type-check && npm run lint
git add app/globals.css components/ui/skeleton-logic.ts components/ui/Skeleton.tsx tests/ui-skeleton-logic.test.mts
git commit -m "feat(ui): add Skeleton primitive + shimmer keyframe"
```

---

## Task 8: Modal (#4) — portal overlay

**Files:**
- Create: `components/ui/Modal.tsx`

Generalizes the portal + escape/outside-click pattern already proven in `components/layout/AppShell.tsx`. SSR-safe via a `mounted` guard; renders nothing when closed.

- [ ] **Step 1: Write the component**

```tsx
// components/ui/Modal.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { font, t } from '@/lib/ui/theme'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  width?: number
}

export function Modal({ open, onClose, title, children, width = 480 }: ModalProps) {
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!mounted || !open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (!panelRef.current?.contains(e.target as Node)) onClose()
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(20,11,48,0.5)' }}
    >
      <div
        ref={panelRef}
        style={{ width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', background: t.surfaceRaised, border: `1px solid ${t.border}`, borderRadius: 16, boxShadow: 'var(--shadow-lift)' }}
      >
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${t.border}` }}>
            <h2 style={{ margin: 0, fontFamily: font.display, fontSize: 16, color: t.text }}>{title}</h2>
            <button onClick={onClose} aria-label="Close" className="button-blank-secondary-icon">
              <X size={18} />
            </button>
          </div>
        )}
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
```

- [ ] **Step 2: Type-check + lint**

Run: `npm run type-check && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/ui/Modal.tsx
git commit -m "feat(ui): add Modal primitive (portal overlay, esc/outside close)"
```

---

## Task 9: Drawer (#4) — slide-in side panel

**Files:**
- Create: `components/ui/Drawer.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/ui/Drawer.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { font, t } from '@/lib/ui/theme'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  width?: number
  side?: 'right' | 'left'
}

export function Drawer({ open, onClose, title, children, width = 420, side = 'right' }: DrawerProps) {
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted || !open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (!panelRef.current?.contains(e.target as Node)) onClose()
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(20,11,48,0.5)' }}
    >
      <div
        ref={panelRef}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          [side]: 0,
          width: '100%',
          maxWidth: width,
          background: t.surfaceRaised,
          borderLeft: side === 'right' ? `1px solid ${t.border}` : undefined,
          borderRight: side === 'left' ? `1px solid ${t.border}` : undefined,
          boxShadow: 'var(--shadow-lift)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${t.border}` }}>
          {title && <h2 style={{ margin: 0, fontFamily: font.display, fontSize: 16, color: t.text }}>{title}</h2>}
          <button onClick={onClose} aria-label="Close" className="button-blank-secondary-icon" style={{ marginLeft: 'auto' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
```

- [ ] **Step 2: Type-check + lint**

Run: `npm run type-check && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/ui/Drawer.tsx
git commit -m "feat(ui): add Drawer primitive (slide-in side panel)"
```

---

## Task 10: Barrel export

**Files:**
- Create: `components/ui/index.ts`

- [ ] **Step 1: Write the barrel**

```ts
// components/ui/index.ts
export { Button } from './Button'
export { buttonClass, type ButtonVariant } from './variants'
export { Field, Input, Select, Textarea } from './form'
export { PageHeader } from './PageHeader'
export { Tabs, type TabItem } from './Tabs'
export { isTabActive } from './tabs-logic'
export { EmptyState } from './EmptyState'
export { Skeleton, SkeletonText } from './Skeleton'
export { skeletonRows } from './skeleton-logic'
export { Modal } from './Modal'
export { Drawer } from './Drawer'
```

> Note: `ThemeToggle.tsx` already lives in `components/ui/` and is imported directly; leave it out of the barrel to avoid pulling client-only theme logic into every importer.

- [ ] **Step 2: Type-check + lint**

Run: `npm run type-check && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/ui/index.ts
git commit -m "feat(ui): add components/ui barrel export"
```

---

## Task 11: Preview gallery (visual verification, flagged)

**Files:**
- Create: `app/[locale]/(protected)/_ui-preview/page.tsx`

A temporary gallery rendering every primitive, used only to screenshot-verify the editorial skin. Gated behind `MOVY_PREVIEW` so it never ships to production.

- [ ] **Step 1: Write the page**

```tsx
// app/[locale]/(protected)/_ui-preview/page.tsx
import { notFound } from 'next/navigation'
import { UiPreviewClient } from './UiPreviewClient'

export default function UiPreviewPage() {
  if (process.env.MOVY_PREVIEW !== '1') notFound()
  return <UiPreviewClient />
}
```

- [ ] **Step 2: Write the client gallery**

```tsx
// app/[locale]/(protected)/_ui-preview/UiPreviewClient.tsx
'use client'

import { useState } from 'react'
import { Inbox } from 'lucide-react'
import { Button, Field, Input, Select, Textarea, PageHeader, EmptyState, Skeleton, SkeletonText, Modal, Drawer } from '@/components/ui'

export function UiPreviewClient() {
  const [modal, setModal] = useState(false)
  const [drawer, setDrawer] = useState(false)
  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <PageHeader
        eyebrow="UI Preview"
        title="Primitives gallery"
        description="Temporary surface to verify the shared primitives in movy's editorial skin."
        actions={<Button variant="primary">Primary action</Button>}
      />

      <section style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="primary" loading>Loading</Button>
        <Button onClick={() => setModal(true)}>Open modal</Button>
        <Button onClick={() => setDrawer(true)}>Open drawer</Button>
      </section>

      <section className="movy-card" style={{ padding: 20, display: 'grid', gap: 14, maxWidth: 420 }}>
        <Field label="Name"><Input placeholder="Jane Doe" /></Field>
        <Field label="Role" hint="Controls access level">
          <Select defaultValue="editor">
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </Select>
        </Field>
        <Field label="Notes"><Textarea placeholder="..." /></Field>
      </section>

      <EmptyState icon={Inbox} title="Nothing here yet" description="When records exist they show up here." action={<Button variant="primary">Create one</Button>} />

      <section className="movy-card" style={{ padding: 20, display: 'grid', gap: 12 }}>
        <Skeleton width={180} height={20} />
        <SkeletonText lines={3} />
      </section>

      <Modal open={modal} onClose={() => setModal(false)} title="Example modal">
        <p style={{ margin: 0 }}>Modal body content.</p>
      </Modal>
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Example drawer">
        <p style={{ margin: 0 }}>Drawer body content.</p>
      </Drawer>
    </div>
  )
}
```

- [ ] **Step 3: Type-check + lint**

Run: `npm run type-check && npm run lint`
Expected: PASS.

- [ ] **Step 4: Visual verification (both themes)**

Run the dev server with the flag and screenshot the gallery in light and dark:

```bash
MOVY_PREVIEW=1 npm run dev
```

Navigate to `/en/_ui-preview`. Capture screenshots (preview tools or openwolf `designqc`). Confirm:
- Buttons use purple fill / outline; no generic CRM look.
- Display font (Clash Display) on PageHeader title + EmptyState/Modal titles.
- Hairline borders; gold accent only where intended.
- Modal + Drawer overlay, esc + outside-click close, body scroll lock (modal).
- Skeleton shimmer animates (and is static under reduced-motion).
- Dark theme flips surfaces correctly.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/(protected)/_ui-preview"
git commit -m "chore(ui): add flagged primitives preview gallery"
```

---

## Self-Review (completed during planning)

- **Spec coverage:** Phase-0 deliverables in the spec are #2 PageHeader, #3 Tabs, #4 Modal+Drawer, #5 Skeleton, #6/form primitives, #9 EmptyState → Tasks 2–9. #1 sidebar already satisfied by `AppShell.tsx` (no task; later phases verify). #11 tokens already satisfied (`theme.ts`). #7 list/detail, #8 filters, #10 charts are screen-level → deferred to Phases 1–4, not Phase 0.
- **Placeholder scan:** none — every step has complete code/commands.
- **Type consistency:** `buttonClass`/`ButtonVariant` (Task 1) reused in Button (2) and barrel (10); `isTabActive` (5) reused in Tabs; `skeletonRows` (7) reused in SkeletonText; barrel names match each component's export.

## Done criteria

- `components/ui/` exports Button, Field/Input/Select/Textarea, PageHeader, Tabs, EmptyState, Skeleton/SkeletonText, Modal, Drawer via barrel.
- `npm test`, `npm run type-check`, `npm run lint` all green.
- Preview gallery screenshot-verified in light + dark, editorial identity intact.
- Nothing committed to `main`; all work on `design/woofed-ux-alignment`.
