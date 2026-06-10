'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isAdminOrAbove } from '@/lib/permissions/can'
import { DEPARTMENTS, DEPT_COLORS, getDeptName } from '@/lib/constants/departments'
import type { Profile } from '@/lib/auth/get-user'

interface AppShellProps {
  profile: Profile
  locale: string
  children: React.ReactNode
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: '#D23B2B',
  admin: '#F36B1C',
  editor: '#4B1A77',
  reader: '#2A1153',
}

export function AppShell({ profile, locale, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

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

  const roleColor = ROLE_COLORS[profile.role] ?? '#2A1153'

  const mainNav = [
    { href: `/${locale}/home`, icon: 'home', label: 'Inicio' },
    { href: `/${locale}/study-plans`, icon: 'quote', label: locale === 'en' ? 'Proposals' : 'Propostas' },
    { href: `/${locale}/wiki`, icon: 'book', label: locale === 'en' ? 'Knowledge' : 'Informacoes' },
  ]

  const adminNav = isAdminOrAbove(profile.role)
    ? [
        { href: `/${locale}/settings/users`, icon: 'users', label: locale === 'pt' ? 'Usuarios' : 'Users' },
        { href: `/${locale}/settings/audit-log`, icon: 'log', label: 'Audit Log' },
        { href: `/${locale}/settings`, icon: 'settings', label: locale === 'pt' ? 'Configuracoes' : 'Settings' },
      ]
    : []

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '22px 18px' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '0 6px' }}>
        <MovyMark size={32} />
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: '#F9F9F9' }}>Movy</div>
          <div style={{ fontSize: 11, color: 'rgba(249,249,249,0.55)', letterSpacing: '0.02em' }}>Internal Hub</div>
        </div>
      </div>

      {/* Search shortcut */}
      <button
        type="button"
        onClick={() => router.push(`/${locale}/search`)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          background: 'rgba(249,249,249,0.06)',
          border: '1px solid rgba(249,249,249,0.08)',
          color: 'rgba(249,249,249,0.6)',
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: 'Outfit, sans-serif',
          marginBottom: 18,
        }}
      >
        <SearchIcon />
        <span style={{ flex: 1, textAlign: 'left' }}>
          {locale === 'pt' ? 'Pesquisar informacoes...' : 'Search knowledge...'}
        </span>
        <kbd style={{
          fontSize: 10, padding: '1px 5px', borderRadius: 4,
          background: 'rgba(249,249,249,0.08)',
          fontFamily: 'ui-monospace, monospace',
          color: 'rgba(249,249,249,0.6)',
        }}>Ctrl K</kbd>
      </button>

      {/* Main nav */}
      <NavGroup label="Main">
        {mainNav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={isActive(item.href)}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </NavGroup>

      {/* Departments */}
      <NavGroup label={locale === 'en' ? 'Areas' : 'Áreas'}>
        {DEPARTMENTS.map((dept) => (
          <NavItemDept
            key={dept.slug}
            href={`/${locale}/departments/${dept.slug}`}
            label={getDeptName(dept, locale)}
            color={DEPT_COLORS[dept.slug] ?? '#2A1153'}
            active={pathname.includes(`/departments/${dept.slug}`)}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </NavGroup>

      {/* Admin nav */}
      {adminNav.length > 0 && (
        <NavGroup label="Admin">
          {adminNav.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={isActive(item.href)}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </NavGroup>
      )}

      <div style={{ flex: 1 }} />

      {/* User card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        background: 'rgba(249,249,249,0.05)',
        borderRadius: 12,
      }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 999,
          background: roleColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 600,
          color: '#fff',
          fontFamily: 'Outfit, sans-serif',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#F9F9F9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile.full_name ?? profile.email}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(249,249,249,0.55)' }}>
            {profile.role.replace('_', ' ')}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          title="Sair"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(249,249,249,0.55)', padding: 4 }}
        >
          <LogoutIcon />
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F7FB' }}>
      {/* Desktop sidebar */}
      <aside
        style={{
          width: 264,
          flexShrink: 0,
          background: '#2A1153',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          borderRight: '1px solid rgba(249,249,249,0.06)',
        }}
        className="hidden lg:flex"
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(28,18,51,0.5)' }}
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 30,
          width: 264,
          background: '#2A1153',
          borderRight: '1px solid rgba(249,249,249,0.06)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 200ms ease-in-out',
          height: '100vh',
        }}
        className="lg:hidden"
      >
        <SidebarContent />
      </aside>

      {/* Main */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        {/* Mobile topbar */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            height: 56,
            borderBottom: '1px solid rgba(28,18,51,0.08)',
            background: 'rgba(249,249,249,0.7)',
            backdropFilter: 'blur(12px)',
            padding: '0 16px',
          }}
          className="lg:hidden"
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(28,18,51,0.7)' }}
          >
            <HamburgerIcon />
          </button>
          <MovyMark size={24} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#2A1153' }}>Internal Hub</span>
        </header>

        {/* Desktop topbar */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            padding: '14px 32px',
            borderBottom: '1px solid rgba(28,18,51,0.06)',
            background: 'rgba(249,249,249,0.7)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 5,
          }}
          className="hidden lg:flex"
        >
          <BreadcrumbFromPath pathname={pathname} locale={locale} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              background: roleColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              fontFamily: 'Outfit, sans-serif',
              cursor: 'pointer',
            }} title={profile.full_name ?? profile.email}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '32px 36px', maxWidth: 1320, margin: '0 auto', width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        color: 'rgba(249,249,249,0.4)',
        padding: '0 10px',
        marginBottom: 6,
      }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {children}
      </div>
    </div>
  )
}

function NavItem({ href, icon, label, active, onClick }: {
  href: string; icon: string; label: string; active: boolean; onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '8px 11px',
        background: active ? 'rgba(249,249,249,0.1)' : 'transparent',
        borderRadius: 9,
        color: active ? '#F9F9F9' : 'rgba(249,249,249,0.7)',
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        fontFamily: 'Outfit, sans-serif',
        textDecoration: 'none',
        transition: 'background .15s ease',
      }}
    >
      <NavIcon name={icon} active={active} />
      <span style={{ flex: 1 }}>{label}</span>
      {active && (
        <span style={{ width: 4, height: 16, borderRadius: 2, background: '#F36B1C', flexShrink: 0 }} />
      )}
    </Link>
  )
}

function NavItemDept({ href, label, color, active, onClick }: {
  href: string; label: string; color: string; active: boolean; onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '8px 11px',
        background: active ? 'rgba(249,249,249,0.1)' : 'transparent',
        borderRadius: 9,
        color: active ? '#F9F9F9' : 'rgba(249,249,249,0.7)',
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        fontFamily: 'Outfit, sans-serif',
        textDecoration: 'none',
        transition: 'background .15s ease',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color, marginLeft: 2, marginRight: 2, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{label}</span>
      {active && (
        <span style={{ width: 4, height: 16, borderRadius: 2, background: '#F36B1C', flexShrink: 0 }} />
      )}
    </Link>
  )
}

function BreadcrumbFromPath({ pathname, locale }: { pathname: string; locale: string }) {
  const segments = pathname.replace(`/${locale}`, '').split('/').filter(Boolean)
  const homeLabel = locale === 'en' ? 'Home' : 'Inicio'
  const items = [{ label: homeLabel, href: `/${locale}/home` }]

  const labelMap: Record<string, string> = {
    home: homeLabel,
    dashboard: homeLabel,
    search: locale === 'en' ? 'Search' : 'Busca',
    departments: locale === 'en' ? 'Areas' : 'Areas',
    settings: 'Settings',
    wiki: locale === 'en' ? 'Knowledge' : 'Informacoes',
    users: locale === 'pt' ? 'Usuarios' : 'Users',
    'audit-log': 'Audit Log',
  }

  if (segments[0] === 'wiki') {
    items.push({ label: labelMap.wiki, href: `/${locale}/wiki` })
    if (segments[1] && segments[1] !== 'new') {
      items.push({ label: segments[1], href: `/${locale}/wiki/${segments[1]}` })
    } else if (segments[1] === 'new') {
      items.push({ label: locale === 'pt' ? 'Novo' : 'New', href: `/${locale}/wiki/new` })
    }
  } else if (segments[0] === 'departments') {
    items.push({ label: labelMap.departments, href: `/${locale}/departments` })
    if (segments[1]) {
      const deptLabel = DEPARTMENTS.find((d) => d.slug === segments[1])
      items.push({
        label: deptLabel ? getDeptName(deptLabel, locale) : segments[1],
        href: `/${locale}/departments/${segments[1]}`,
      })
    }
  } else if (segments[0] === 'settings') {
    items.push({ label: labelMap.settings, href: `/${locale}/settings` })
    if (segments[1]) {
      items.push({
        label: labelMap[segments[1]] ?? segments[1],
        href: `/${locale}/settings/${segments[1]}`,
      })
    }
  } else if (segments[0] && segments[0] !== 'home') {
    items.push({ label: labelMap[segments[0]] ?? segments[0], href: `/${locale}/${segments[0]}` })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
      {items.map((item, i) => (
        <span key={item.href} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {i > 0 && (
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(28,18,51,0.4)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          )}
          <Link
            href={item.href}
            style={{
              color: i === items.length - 1 ? '#2A1153' : 'rgba(28,18,51,0.55)',
              fontWeight: i === items.length - 1 ? 600 : 500,
              textDecoration: 'none',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {item.label}
          </Link>
        </span>
      ))}
    </div>
  )
}

function MovyMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Movy">
      <path d="M22 8 C24 8, 26 9, 26 13 L20 50 C19 56, 16 58, 13 58 C10 58, 8 56, 9 51 L17 13 C18 10, 20 8, 22 8 Z" fill="#D23B2B" />
      <path d="M34 14 C36 14, 38 15, 38 19 L32 51 C31 56, 28 58, 25 58 C22 58, 20 56, 21 52 L29 19 C30 16, 32 14, 34 14 Z" fill="#F36B1C" />
      <path d="M46 20 C48 20, 50 21, 50 25 L44 52 C43 56, 40 58, 37 58 C34 58, 32 56, 33 53 L41 25 C42 22, 44 20, 46 20 Z" fill="#4B1A77" />
    </svg>
  )
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? '#F9F9F9' : 'rgba(249,249,249,0.55)'
  const s = { stroke: color, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const icons: Record<string, React.ReactNode> = {
    home: <><path d="M3 11l9-8 9 8" {...s} /><path d="M5 10v10h14V10" {...s} /></>,
    quote: <><path d="M5 5h14v14H5z" {...s} /><path d="M8 9h8M8 13h5M15 16l1.5 1.5L20 14" {...s} /></>,
    search: <><circle cx="11" cy="11" r="6" {...s} /><path d="M20 20l-4-4" {...s} /></>,
    book: <><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z" {...s} /><path d="M4 17a3 3 0 0 1 3-3h11" {...s} /></>,
    megaphone: <><path d="M3 10v4l11 5V5L3 10z" {...s} /><path d="M14 8a4 4 0 0 1 0 8" {...s} /></>,
    users: <><circle cx="9" cy="8" r="3.5" {...s} /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" {...s} /><circle cx="17" cy="9" r="2.5" {...s} /><path d="M15 20c0-2.5 2-4.5 4.5-4.5" {...s} /></>,
    log: <><path d="M5 4h11l3 3v13H5z" {...s} /><path d="M8 9h8M8 13h8M8 17h5" {...s} /></>,
    settings: <><circle cx="12" cy="12" r="3" {...s} /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2L10 21h4l.6-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" {...s} /></>,
  }
  return (
    <svg width={16} height={16} viewBox="0 0 24 24">
      {icons[name] ?? null}
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5M5 12h11" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
