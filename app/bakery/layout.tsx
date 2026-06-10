'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { bakeryApi } from '@/lib/bakery-api'

type User = { id: number; name: string; username: string; role: string }

export default function BakeryLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/bakery') return
    bakeryApi.auth.me()
      .then(setUser)
      .catch(() => router.push('/bakery'))
  }, [pathname])

  if (pathname === '/bakery') return <>{children}</>

  const NAV = [
    { href: '/bakery/dashboard', label: 'Dashboard' },
    { href: '/bakery/orders', label: 'Orders' },
    { href: '/bakery/ghabashi', label: 'Ghabashi Checklist' },
  ]

  async function logout() {
    await bakeryApi.auth.logout()
    router.push('/bakery')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#faf8f5' }}>

      {/* Mobile overlay */}
      {mobileNavOpen && (
        <div onClick={() => setMobileNavOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />
      )}

      <aside className={`bakery-sidebar ${mobileNavOpen ? 'open' : ''}`}
        style={{ width: 200, background: '#2d1f14', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', zIndex: 100 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Manager Supervised</div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 11 }}>Staff Portal</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {NAV.map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link key={href} href={href} onClick={() => setMobileNavOpen(false)} style={{
                display: 'block', padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                color: active ? 'white' : 'rgba(255,255,255,.5)',
                background: active ? 'rgba(200,115,58,.35)' : 'transparent',
                fontWeight: active ? 600 : 400, fontSize: 13, textDecoration: 'none',
              }}>{label}</Link>
            )
          })}
        </nav>
        {user && (
          <div style={{ padding: '12px 10px 16px', borderTop: '1px solid rgba(255,255,255,.1)' }}>
            <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,.05)', borderRadius: 8, marginBottom: 6 }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: 12 }}>{user.name}</div>
              <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 10 }}>@{user.username}</div>
            </div>
            <button onClick={logout} style={{ width: '100%', background: 'none', border: 'none', color: '#f87171', fontSize: 12, cursor: 'pointer', padding: '6px 12px', borderRadius: 8, textAlign: 'left' }}>
              Sign Out
            </button>
          </div>
        )}
      </aside>

      <main className="bakery-main" style={{ marginLeft: 200, flex: 1, padding: 24 }}>
        {/* Mobile top bar */}
        <div className="bakery-topbar">
          <button onClick={() => setMobileNavOpen(o => !o)}
            style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.15)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Manager Supervised</span>
        </div>
        {children}
      </main>
    </div>
  )
}
