'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  ClipboardList,
  Calculator,
  ArrowLeftRight,
  BookText,
  LayoutGrid,
  Settings,
  Menu,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isAdminOrAbove } from '@/lib/permissions/can'
import { DEPARTMENTS, getDeptName } from '@/lib/constants/departments'
import { MovyMark } from '@/components/brand/MovyMark'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { roleColor as ROLE_COLOR, t, ink, font } from '@/lib/ui/theme'
import type { Profile } from '@/lib/auth/get-user'

interface AppShellProps {
  profile: Profile
  locale: string
  children: React.ReactNode
}

interface NavEntry {
  href: string
  icon: LucideIcon
  label: string
}

const SIDEBAR_STORAGE_KEY = 'movy-sidebar-collapsed'
const W_EXPANDED = 208
const W_COLLAPSED = 76

export function AppShell({ profile, locale, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Hydrate collapse preference after mount (avoids SSR mismatch).
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1')
    } catch {
      /* ignore */
    }
  }, [])

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  function isActive(href: string) {
    return pathname.startsWith(href)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
  }

  const initials = (profile.full_name ?? profile.email)
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const roleColor = ROLE_COLOR[profile.role] ?? '#2A1153'

  const mainNav: NavEntry[] = [
    { href: `/${locale}/home`, icon: Home, label: 'Home' },
    { href: `/${locale}/study-plans`, icon: ClipboardList, label: locale === 'en' ? 'Proposals' : 'Propostas' },
    { href: `/${locale}/financial`, icon: Calculator, label: locale === 'en' ? 'Financial' : 'Capacidade Financeira' },
    { href: `/${locale}/cambio`, icon: ArrowLeftRight, label: locale === 'en' ? 'Exchange' : 'Câmbio' },
    { href: `/${locale}/wiki`, icon: BookText, label: locale === 'en' ? 'Knowledge' : 'Informações' },
    { href: `/${locale}/departments`, icon: LayoutGrid, label: locale === 'en' ? 'Departments' : 'Departamentos' },
  ]

  const settingsEntry: NavEntry | null = isAdminOrAbove(profile.role)
    ? { href: `/${locale}/settings`, icon: Settings, label: locale === 'pt' ? 'Configurações' : 'Settings' }
    : null

  // `forceExpanded` is used by the mobile drawer, which always shows labels.
  const SidebarContent = ({ forceExpanded = false }: { forceExpanded?: boolean }) => {
    const isCollapsed = collapsed && !forceExpanded
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, padding: 16, boxSizing: 'border-box' }}>
        {/* Logo + collapse toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', gap: 8, marginBottom: 24, minHeight: 40 }}>
          {!isCollapsed && (
            <Link href={`/${locale}/home`} prefetch={false} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <MovyMark size={30} />
              <span style={{ lineHeight: 1 }}>
                <span style={{ display: 'block', fontFamily: font.display, fontWeight: 600, fontSize: 19, letterSpacing: '-0.01em', color: t.text }}>MOVY</span>
                <span style={{ display: 'block', fontFamily: font.ui, fontWeight: 700, fontSize: 8.5, letterSpacing: '0.24em', color: 'var(--movy-gold)', marginTop: 4 }}>INTERNAL HUB</span>
              </span>
            </Link>
          )}
          <button
            onClick={forceExpanded ? () => setMobileOpen(false) : toggleCollapsed}
            className="button-blank-secondary-icon"
            aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            title={isCollapsed ? 'Expandir' : 'Recolher'}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {mainNav.map((item) => (
            <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={isCollapsed} onClick={() => setMobileOpen(false)} />
          ))}
        </nav>

        {/* Footer: settings */}
        {settingsEntry && (
          <>
            <div style={{ height: 1, background: t.border, margin: '12px 0' }} />
            <NavItem item={settingsEntry} active={isActive(settingsEntry.href)} collapsed={isCollapsed} onClick={() => setMobileOpen(false)} />
          </>
        )}
      </div>
    )
  }

  return (
    <div className="movy-atmosphere" style={{ display: 'flex', minHeight: '100dvh', background: t.bg }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex color-bg-surface-default"
        style={{
          width: collapsed ? W_COLLAPSED : W_EXPANDED,
          flexShrink: 0,
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100dvh',
          borderRight: `1px solid ${t.border}`,
          overflow: 'hidden',
          transition: 'width 280ms var(--ease)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay + drawer */}
      {mobileOpen && (
        <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(20,11,48,0.5)' }} onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className="lg:hidden color-bg-surface-default"
        style={{
          position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 30, width: W_EXPANDED,
          borderRight: `1px solid ${t.border}`,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 220ms var(--ease)', height: '100dvh', overflow: 'hidden',
        }}
      >
        <SidebarContent forceExpanded />
      </aside>

      {/* Main column */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100dvh' }}>
        {/* Mobile topbar */}
        <header className="flex lg:hidden navbar-container" style={{ height: 56, padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setMobileOpen(true)} aria-label="Abrir menu" className="button-blank-secondary-icon">
              <Menu size={22} />
            </button>
            <MovyMark size={24} />
            <span style={{ fontFamily: font.display, fontSize: 16, fontWeight: 600, color: t.text, letterSpacing: '-0.01em' }}>MOVY</span>
          </div>
          <ThemeToggle compact />
        </header>

        {/* Desktop topbar */}
        <header className="hidden lg:flex navbar-container">
          <BreadcrumbFromPath pathname={pathname} locale={locale} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={locale === 'en' ? 'Account menu' : 'Menu da conta'}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, borderRadius: 999 }}
            >
              <Avatar initials={initials} color={roleColor} size={34} />
            </button>
            {menuOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setMenuOpen(false)} />
                <div role="menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', zIndex: 50, width: 230, background: t.surfaceRaised, border: `1px solid ${t.border}`, borderRadius: 14, boxShadow: 'var(--shadow-lift)', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${t.border}` }}>
                    <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: 14, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.full_name ?? profile.email}</div>
                    <div style={{ fontFamily: font.body, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: roleColor, textTransform: 'uppercase', marginTop: 3 }}>{profile.role.replace('_', ' ')}</div>
                  </div>
                  {settingsEntry && (
                    <MenuLink href={settingsEntry.href} onClick={() => setMenuOpen(false)}>
                      {settingsEntry.label}
                    </MenuLink>
                  )}
                  <button role="menuitem" onClick={handleSignOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', padding: '11px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: font.ui, fontSize: 13, fontWeight: 600, color: '#D23B2B' }}>
                    <LogOut size={15} />
                    {locale === 'en' ? 'Sign out' : 'Sair'}
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <main style={{ padding: '36px 36px 64px', maxWidth: 1240, margin: '0 auto', width: '100%' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

function Avatar({ initials, color, size }: { initials: string; color: string; size: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: 999, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: '#fff', fontFamily: font.ui, flexShrink: 0 }}>
      {initials}
    </span>
  )
}

function MenuLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} prefetch={false} onClick={onClick} role="menuitem" style={{ display: 'block', padding: '11px 16px', textDecoration: 'none', fontFamily: font.ui, fontSize: 13, fontWeight: 600, color: t.text }}>
      {children}
    </Link>
  )
}

function NavItem({ item, active, collapsed, onClick }: { item: NavEntry; active: boolean; collapsed: boolean; onClick: () => void }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      prefetch={false}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      className={active ? 'button-menu-default-selected-md' : 'button-menu-default-md'}
      style={collapsed ? { justifyContent: 'center', padding: 0, width: 44, height: 44 } : undefined}
    >
      <Icon size={20} strokeWidth={1.6} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
    </Link>
  )
}

function BreadcrumbFromPath({ pathname, locale }: { pathname: string; locale: string }) {
  const segments = pathname.replace(`/${locale}`, '').split('/').filter(Boolean)
  const items = [{ label: 'Home', href: `/${locale}/home` }]

  const labelMap: Record<string, string> = {
    home: 'Home',
    departments: locale === 'en' ? 'Departments' : 'Departamentos',
    settings: locale === 'en' ? 'Settings' : 'Configurações',
    wiki: locale === 'en' ? 'Knowledge' : 'Informações',
    financial: locale === 'en' ? 'Financial' : 'Capacidade Financeira',
    cambio: locale === 'en' ? 'Exchange' : 'Câmbio',
    'study-plans': locale === 'en' ? 'Proposals' : 'Propostas',
    users: locale === 'pt' ? 'Usuários' : 'Users',
    'audit-log': 'Audit Log',
  }

  if (segments[0] === 'wiki') {
    items.push({ label: labelMap.wiki, href: `/${locale}/wiki` })
    if (segments[1] && segments[1] !== 'new') items.push({ label: segments[1], href: `/${locale}/wiki/${segments[1]}` })
    else if (segments[1] === 'new') items.push({ label: locale === 'pt' ? 'Novo' : 'New', href: `/${locale}/wiki/new` })
  } else if (segments[0] === 'departments') {
    items.push({ label: labelMap.departments, href: `/${locale}/departments` })
    if (segments[1]) {
      const dept = DEPARTMENTS.find((d) => d.slug === segments[1])
      items.push({ label: dept ? getDeptName(dept, locale) : segments[1], href: `/${locale}/departments/${segments[1]}` })
    }
  } else if (segments[0] === 'settings') {
    items.push({ label: labelMap.settings, href: `/${locale}/settings` })
    if (segments[1]) items.push({ label: labelMap[segments[1]] ?? segments[1], href: `/${locale}/settings/${segments[1]}` })
  } else if (segments[0] && segments[0] !== 'home') {
    items.push({ label: labelMap[segments[0]] ?? segments[0], href: `/${locale}/${segments[0]}` })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
      {items.map((item, i) => (
        <span key={item.href} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {i > 0 && <ChevronRight size={13} style={{ color: ink(0.4) }} />}
          <Link href={item.href} prefetch={false} style={{ color: i === items.length - 1 ? t.text : t.textMuted, fontWeight: i === items.length - 1 ? 700 : 500, textDecoration: 'none', fontFamily: font.ui }}>
            {item.label}
          </Link>
        </span>
      ))}
    </div>
  )
}
