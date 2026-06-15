'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const NAV = [
  { href: '/manager', label: 'Operations', exact: true },
  { href: '/manager/hr', label: 'HR & Payroll', exact: false },
  { href: '/manager/evaluations', label: 'Evaluations', exact: false },
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
      const role = (data.user?.app_metadata as { role?: string } | undefined)?.role
      const allowed = !!data.user && (role === 'manager' || role === 'admin' || data.user.email === 'asjad@appetie.com')
      if (!allowed) {
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
      <header style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', minHeight: 52, display: 'flex', alignItems: 'center', padding: '8px 14px', gap: 10, position: 'sticky', top: 0, zIndex: 50, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>Operations</span>

        {/* Nav tabs - scrollable on mobile */}
        <nav className="manager-nav" style={{ flex: 1 }}>
          {NAV.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center',
                padding: '6px 12px', borderRadius: 8, textDecoration: 'none',
                fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                background: active ? '#1e293b' : 'transparent',
                color: active ? '#f59e0b' : '#94a3b8',
                transition: 'all 0.15s',
              }}>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <button onClick={handleSignOut} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
          Sign Out
        </button>
      </header>

      {/* Page content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 14px' }}>
        {children}
      </main>

    </div>
  )
}
