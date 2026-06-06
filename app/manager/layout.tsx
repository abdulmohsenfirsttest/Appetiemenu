'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const NAV = [
  { href: '/manager', label: 'Operations', icon: '⊞', exact: true },
  { href: '/admin/hr', label: 'HR & Payroll', icon: '👤', exact: false },
]

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (pathname === '/manager/login') { setChecked(true); return }
      if (!data.user || data.user.email !== 'asjad@appetie.com') {
        router.replace('/manager/login')
      } else {
        setChecked(true)
      }
    })
  }, [pathname])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/manager/login')
    router.refresh()
  }

  if (pathname === '/manager/login') return <>{children}</>
  if (!checked) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #f59e0b', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'var(--font-dm-sans), sans-serif' }}>

      {/* Top bar */}
      <header style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', height: 56, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👑</div>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Asjad</span>
          <span style={{ fontSize: 12, color: '#475569', marginInlineStart: 8 }}>Operation Manager</span>
        </div>

        {/* Nav tabs */}
        <nav style={{ display: 'flex', gap: 4, marginInlineStart: 16 }}>
          {NAV.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
                fontSize: 13, fontWeight: 600,
                background: active ? '#1e293b' : 'transparent',
                color: active ? '#f59e0b' : '#94a3b8',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ flex: 1 }} />
        <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: '1px solid #334155', background: 'transparent', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </header>

      {/* Page content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        {children}
      </main>

    </div>
  )
}
