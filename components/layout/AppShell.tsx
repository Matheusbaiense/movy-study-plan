'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isAdminOrAbove } from '@/lib/permissions/can'
import { DEPARTMENTS, getDeptName } from '@/lib/constants/departments'
import { MovyMark } from '@/components/brand/MovyMark'
import { roleColor as ROLE_COLOR } from '@/lib/ui/theme'
import type { Profile } from '@/lib/auth/get-user'

interface AppShellProps {
  profile: Profile
  locale: string
  children: React.ReactNode
}

export function AppShell({ profile, locale, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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

  const roleColor = ROLE_COLOR[profile.role] ?? '#2A1153'

  const mainNav = [
    { href: `/${locale}/home`, icon: 'home', label: 'Home' },
    { href: `/${locale}/study-plans`, icon: 'quote', label: locale === 'en' ? 'Proposals' : 'Propostas' },
    { href: `/${locale}/financial`, icon: 'calc', label: locale === 'en' ? 'Financial' : 'Capacidade Financeira' },
    { href: `/${locale}/cambio`, icon: 'fx', label: locale === 'en' ? 'Exchange' : 'Câmbio' },
    { href: `/${locale}/wiki`, icon: 'book', label: locale === 'en' ? 'Knowledge' : 'Informações' },
    { href: `/${locale}/departments`, icon: 'areas', label: locale === 'en' ? 'Departments' : 'Departamentos' },
  ]

  const adminNav = isAdminOrAbove(profile.role)
    ? [{ href: `/${locale}/settings`, icon: 'settings', label: locale === 'pt' ? 'Configurações' : 'Settings' }]
    : []

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflowY: 'auto', padding: '24px 18px', boxSizing: 'border-box' }}>
      {/* Logo lockup */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 28, padding: '0 6px' }}>
        <MovyMark size={34} />
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: '-0.01em', color: '#fff' }}>MOVY</div>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, letterSpacing: '0.32em', color: '#FBB615', marginTop: 4 }}>INTERNAL HUB</div>
        </div>
      </div>

      <NavGroup label="Portal">
        {mainNav.map((item) => (
          <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} active={isActive(item.href)} onClick={() => setMobileOpen(false)} />
        ))}
      </NavGroup>

      {adminNav.length > 0 && (
        <NavGroup label="Admin">
          {adminNav.map((item) => (
            <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} active={isActive(item.href)} onClick={() => setMobileOpen(false)} />
          ))}
        </NavGroup>
      )}

      <div style={{ flex: 1 }} />

      {/* Oversized ghost sail — brand watermark */}
      <div style={{ position: 'relative', height: 70, marginBottom: 6, overflow: 'hidden' }}>
        <svg viewBox="0 0 120 120" width={150} height={150} style={{ position: 'absolute', left: -14, bottom: -52, color: '#fff', opacity: 0.07 }}>
          <use href="#movySymMono" />
        </svg>
      </div>

      {/* User card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
        <Avatar initials={initials} color={roleColor} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile.full_name ?? profile.email}
          </div>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            {profile.role.replace('_', ' ')}
          </div>
        </div>
        <button onClick={handleSignOut} title={locale === 'en' ? 'Sign out' : 'Sair'} aria-label={locale === 'en' ? 'Sign out' : 'Sair'} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', padding: 4 }}>
          <LogoutIcon />
        </button>
      </div>
    </div>
  )

  const sidebarBg = 'linear-gradient(180deg, #2A1153 0%, #1E0D44 64%, #190A38 100%)'

  return (
    <div className="movy-atmosphere" style={{ display: 'flex', minHeight: '100vh', background: '#F8F7FB' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex" style={{ width: 264, flexShrink: 0, background: sidebarBg, flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', borderRight: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay + drawer */}
      {mobileOpen && (
        <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(28,18,51,0.5)' }} onClick={() => setMobileOpen(false)} />
      )}
      <aside className="lg:hidden" style={{ position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 30, width: 264, background: sidebarBg, borderRight: '1px solid rgba(255,255,255,0.06)', transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 220ms cubic-bezier(0.16,1,0.3,1)', height: '100vh', overflow: 'hidden' }}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        {/* Mobile topbar */}
        <header className="flex lg:hidden" style={{ alignItems: 'center', gap: 12, height: 56, borderBottom: '1px solid rgba(28,18,51,0.08)', background: 'rgba(248,247,251,0.8)', backdropFilter: 'blur(12px)', padding: '0 16px', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setMobileOpen(true)} aria-label="Abrir menu" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(28,18,51,0.7)', display: 'flex' }}>
            <HamburgerIcon />
          </button>
          <MovyMark size={26} />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 800, color: '#2A1153', letterSpacing: '-0.01em' }}>MOVY</span>
        </header>

        {/* Desktop topbar */}
        <header className="hidden lg:flex" style={{ alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '14px 32px', borderBottom: '1px solid rgba(28,18,51,0.06)', background: 'rgba(248,247,251,0.72)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 15 }}>
          <BreadcrumbFromPath pathname={pathname} locale={locale} />
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={menuOpen} aria-label={locale === 'en' ? 'Account menu' : 'Menu da conta'} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, borderRadius: 999 }}>
              <Avatar initials={initials} color={roleColor} size={34} />
            </button>
            {menuOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setMenuOpen(false)} />
                <div role="menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', zIndex: 50, width: 230, background: '#fff', border: '1px solid #E0D6EE', borderRadius: 12, boxShadow: '0 16px 40px -16px rgba(42,17,83,0.4)', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #EFE9F6' }}>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: '#2A1153', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.full_name ?? profile.email}</div>
                    <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, letterSpacing: '0.06em', color: roleColor, textTransform: 'uppercase', marginTop: 3 }}>{profile.role.replace('_', ' ')}</div>
                  </div>
                  {adminNav.length > 0 && (
                    <MenuLink href={`/${locale}/settings`} onClick={() => setMenuOpen(false)}>
                      {locale === 'en' ? 'Settings' : 'Configurações'}
                    </MenuLink>
                  )}
                  <button role="menuitem" onClick={handleSignOut} style={{ width: '100%', textAlign: 'left', padding: '11px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600, color: '#D23B2B' }}>
                    {locale === 'en' ? 'Sign out' : 'Sair'}
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main style={{ flex: 1, padding: '36px 36px 64px', maxWidth: 1240, margin: '0 auto', width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

function Avatar({ initials, color, size }: { initials: string; color: string; size: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: 999, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: '#fff', fontFamily: 'Outfit, sans-serif', flexShrink: 0 }}>
      {initials}
    </span>
  )
}

function MenuLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} prefetch={false} onClick={onClick} role="menuitem" style={{ display: 'block', padding: '11px 16px', textDecoration: 'none', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600, color: '#2A1153' }}>
      {children}
    </Link>
  )
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', padding: '0 10px', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{children}</div>
    </div>
  )
}

function NavItem({ href, icon, label, active, onClick }: { href: string; icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px',
        background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
        borderRadius: 9,
        color: active ? '#fff' : 'rgba(255,255,255,0.7)',
        fontFamily: 'Outfit, sans-serif', fontSize: 13.5, fontWeight: active ? 700 : 500,
        textDecoration: 'none', transition: 'background .15s ease',
      }}
    >
      <NavIcon name={icon} active={active} />
      <span style={{ flex: 1 }}>{label}</span>
      {active && <span style={{ width: 4, height: 16, borderRadius: 2, background: '#FBB615', flexShrink: 0 }} />}
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
          {i > 0 && (
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(28,18,51,0.4)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          )}
          <Link href={item.href} prefetch={false} style={{ color: i === items.length - 1 ? '#2A1153' : 'rgba(28,18,51,0.55)', fontWeight: i === items.length - 1 ? 700 : 500, textDecoration: 'none', fontFamily: 'Outfit, sans-serif' }}>
            {item.label}
          </Link>
        </span>
      ))}
    </div>
  )
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? '#FBB615' : 'rgba(255,255,255,0.55)'
  const s = { stroke: color, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const icons: Record<string, React.ReactNode> = {
    home: <><path d="M3 11l9-8 9 8" {...s} /><path d="M5 10v10h14V10" {...s} /></>,
    quote: <><path d="M5 5h14v14H5z" {...s} /><path d="M8 9h8M8 13h5M15 16l1.5 1.5L20 14" {...s} /></>,
    book: <><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z" {...s} /><path d="M4 17a3 3 0 0 1 3-3h11" {...s} /></>,
    areas: <><path d="M4 5h7v7H4z" {...s} /><path d="M13 5h7v7h-7z" {...s} /><path d="M4 14h7v5H4z" {...s} /><path d="M13 14h7v5h-7z" {...s} /></>,
    calc: <><rect x="5" y="3" width="14" height="18" rx="2" {...s} /><path d="M8 7h8M8 11h8M8 15h8" {...s} /></>,
    fx: <><path d="M4 19V5" {...s} /><path d="M4 15l5-5 4 4 7-7" {...s} /><path d="M16 7h4v4" {...s} /></>,
    settings: <><circle cx="12" cy="12" r="3" {...s} /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2L10 21h4l.6-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" {...s} /></>,
  }
  return <svg width={16} height={16} viewBox="0 0 24 24">{icons[name] ?? null}</svg>
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
