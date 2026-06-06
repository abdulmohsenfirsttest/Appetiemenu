'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { AdminThemeProvider, useAdminTheme } from './theme'
import { LanguageProvider, useLanguage } from '@/lib/language-context'

type NavItem = { href: string; labelEn: string; labelAr: string; icon: string; exact?: boolean }
type NavGroup = { labelEn: string; labelAr: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    labelEn: '',
    labelAr: '',
    items: [
      { href: '/admin', labelEn: 'Dashboard', labelAr: 'لوحة التحكم', icon: '⊞', exact: true },
    ],
  },
  {
    labelEn: 'Menus',
    labelAr: 'القوائم',
    items: [
      { href: '/admin/menu',          labelEn: 'Appetie Menu',  labelAr: 'قائمة أباتاي',  icon: '🍽' },
      { href: '/admin/ghabashi-menu', labelEn: 'Ghabashi Menu', labelAr: 'قائمة الغباشي', icon: '🏪' },
    ],
  },
  {
    labelEn: 'Management',
    labelAr: 'الإدارة',
    items: [
      { href: '/admin/branches', labelEn: 'Branches',           labelAr: 'الفروع',                       icon: '◉' },
      { href: '/admin/hr',         labelEn: 'HR & Payroll',       labelAr: 'الرواتب والموارد البشرية',      icon: '👤' },
      { href: '/admin/hr/manager',    labelEn: 'Asjad — Manager',    labelAr: 'أسجد — المدير',    icon: '👑' },
      { href: '/admin/hr/supervisor', labelEn: 'Supervisor Panel',  labelAr: 'لوحة المشرف',      icon: '🔑' },
      { href: '/admin/bakery',   labelEn: 'Manager Supervised', labelAr: 'إشراف المدير',                  icon: '🥐' },
    ],
  },
]

function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { dark, toggle: toggleTheme } = useAdminTheme()
  const { lang, toggle: toggleLang, t, isAr } = useLanguage()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const allNavItems = NAV_GROUPS.flatMap(g => g.items)
  const activeItem = allNavItems.find(n => isActive(n.href, n.exact))
  const activeLabel = activeItem ? (isAr ? activeItem.labelAr : activeItem.labelEn) : 'Admin'

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--admin-bg)', fontFamily: isAr ? 'Tajawal, var(--font-dm-sans), sans-serif' : 'var(--font-dm-sans), sans-serif' }}>

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside style={{
        width: collapsed ? 60 : 220, flexShrink: 0,
        background: '#0f172a', display: 'flex', flexDirection: 'column',
        height: '100vh', transition: 'width 0.2s ease', overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 10, minHeight: 64 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Image src="/logo.png" alt="Appetie" width={24} height={24} style={{ filter: 'brightness(0) invert(1)', objectFit: 'contain', width: 22, height: 'auto' }} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'white', whiteSpace: 'nowrap' }}>Appetie</div>
              <div style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap' }}>{t('Admin Panel', 'لوحة الإدارة')}</div>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)}
            style={{ marginInlineStart: 'auto', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 16, flexShrink: 0, padding: 2 }}>
            {collapsed ? (isAr ? '‹' : '›') : (isAr ? '›' : '‹')}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 4 }}>
              {group.labelEn && !collapsed && (
                <div style={{ padding: '10px 12px 4px', fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {isAr ? group.labelAr : group.labelEn}
                </div>
              )}
              {group.labelEn && collapsed && gi > 0 && (
                <div style={{ height: 1, background: '#1e293b', margin: '8px 4px' }} />
              )}
              {group.items.map(item => {
                const active = isActive(item.href, item.exact)
                return (
                  <Link key={item.href} href={item.href} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: collapsed ? '10px 0' : '9px 12px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 8, marginBottom: 2, textDecoration: 'none',
                    background: active ? '#1e293b' : 'transparent',
                    color: active ? '#25D366' : '#94a3b8',
                    fontWeight: active ? 600 : 400, fontSize: 13,
                    transition: 'all 0.15s',
                  }}
                    onMouseOver={e => { if (!active) e.currentTarget.style.background = '#1e293b' }}
                    onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                    {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{isAr ? item.labelAr : item.labelEn}</span>}
                    {!collapsed && active && <span style={{ marginInlineStart: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#25D366', flexShrink: 0 }} />}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Bottom links */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Link href="/manager" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: collapsed ? '8px 0' : '8px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 8, textDecoration: 'none', color: '#f59e0b', fontSize: 12, fontWeight: 600,
          }}>
            <span>👑</span>
            {!collapsed && <span>Manager Portal</span>}
          </Link>
          <Link href="/" target="_blank" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: collapsed ? '8px 0' : '8px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 8, textDecoration: 'none', color: '#475569', fontSize: 12,
          }}>
            <span>↗</span>
            {!collapsed && <span>{t('Appetie Menu', 'قائمة أباتاي')}</span>}
          </Link>
          <Link href="/ghabashi" target="_blank" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: collapsed ? '8px 0' : '8px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 8, textDecoration: 'none', color: '#475569', fontSize: 12,
          }}>
            <span>↗</span>
            {!collapsed && <span>{t('Ghabashi Menu', 'قائمة الغباشي')}</span>}
          </Link>

          <button onClick={handleSignOut} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: collapsed ? '8px 0' : '8px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 8, background: 'none', border: 'none',
            color: '#ef4444', fontSize: 12, cursor: 'pointer', width: '100%',
            transition: 'background 0.15s',
          }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
            onMouseOut={e => (e.currentTarget.style.background = 'none')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {!collapsed && <span>{t('Sign Out', 'تسجيل الخروج')}</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{
          height: 56, background: 'var(--admin-header)', borderBottom: '1px solid var(--admin-border)',
          display: 'flex', alignItems: 'center', padding: '0 24px', flexShrink: 0, gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>{activeLabel}</span>
          </div>

          {/* Language toggle */}
          <button onClick={toggleLang} title={isAr ? 'Switch to English' : 'التبديل إلى العربية'} style={{
            height: 36, padding: '0 14px', borderRadius: 10, border: '1.5px solid var(--admin-border)',
            background: isAr ? '#25D366' : 'var(--admin-card)', cursor: 'pointer',
            fontSize: 12, fontWeight: 700, color: isAr ? 'white' : 'var(--admin-text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s', flexShrink: 0, letterSpacing: '0.04em',
          }}>
            {isAr ? 'EN' : 'AR'}
          </button>

          {/* Dark mode toggle */}
          <button onClick={toggleTheme} title={dark ? 'Switch to light mode' : 'Switch to dark mode'} style={{
            width: 36, height: 36, borderRadius: 10, border: '1px solid var(--admin-border)',
            background: 'var(--admin-card)', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s', flexShrink: 0,
          }}>
            {dark ? '☀️' : '🌙'}
          </button>

          <div style={{ fontSize: 13, color: '#94a3b8' }}>Appetie · اباتاي</div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--admin-bg)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/admin/login') return <>{children}</>
  return (
    <AdminThemeProvider>
      <LanguageProvider>
        <AdminLayoutShell>{children}</AdminLayoutShell>
      </LanguageProvider>
    </AdminThemeProvider>
  )
}
