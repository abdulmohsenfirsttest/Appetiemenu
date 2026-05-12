'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin',            label: 'Dashboard',   icon: '⊞',  exact: true },
  { href: '/admin/menu',       label: 'Menu',         icon: '🍽' },
  { href: '/admin/categories', label: 'Categories',   icon: '◫' },
  { href: '/admin/hr',         label: 'HR & Payroll', icon: '👤' },
  { href: '/admin/branches',   label: 'Branches',     icon: '◉' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div dir="ltr" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc', fontFamily: 'var(--font-dm-sans), sans-serif' }}>

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside style={{
        width: collapsed ? 60 : 220,
        flexShrink: 0,
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 10, minHeight: 64 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Image src="/logo.png" alt="Appetie" width={24} height={24} style={{ filter: 'brightness(0) invert(1)', objectFit: 'contain', width: 22, height: 'auto' }} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'white', whiteSpace: 'nowrap' }}>Appetie</div>
              <div style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap' }}>Admin Panel</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ marginInlineStart: 'auto', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 16, flexShrink: 0, padding: 2 }}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {NAV.map(item => {
            const active = isActive(item.href, item.exact)
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 0' : '9px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8, marginBottom: 2, textDecoration: 'none',
                background: active ? '#1e293b' : 'transparent',
                color: active ? '#25D366' : '#94a3b8',
                fontWeight: active ? 600 : 400,
                fontSize: 13,
                transition: 'all 0.15s',
              }}
                onMouseOver={e => { if (!active) e.currentTarget.style.background = '#1e293b' }}
                onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                {!collapsed && active && <span style={{ marginInlineStart: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#25D366', flexShrink: 0 }} />}
              </Link>
            )
          })}
        </nav>

        {/* View menu link */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #1e293b' }}>
          <Link href="/" target="_blank" style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: collapsed ? '8px 0' : '8px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 8, textDecoration: 'none', color: '#475569', fontSize: 12,
          }}>
            <span>↗</span>
            {!collapsed && <span>Customer Menu</span>}
          </Link>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{
          height: 56, background: 'white', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {NAV.find(n => isActive(n.href, n.exact))?.label ?? 'Admin'}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Appetie · اباتاي</div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
