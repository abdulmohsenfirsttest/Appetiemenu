'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (pathname === '/supervisor/login') { setChecked(true); return }
    fetch('/api/supervisor/auth/me')
      .then(r => {
        if (!r.ok) router.replace('/supervisor/login')
        else setChecked(true)
      })
      .catch(() => router.replace('/supervisor/login'))
  }, [pathname, router])

  async function handleSignOut() {
    await fetch('/api/supervisor/auth/logout', { method: 'POST' })
    router.replace('/supervisor/login')
  }

  if (!checked) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #334155', borderTopColor: '#818cf8', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (pathname === '/supervisor/login') return <>{children}</>

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <header style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🔑</div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Supervisor Panel</span>
          <span style={{ fontSize: 12, color: '#475569', marginInlineStart: 8 }}>Ghabashi Operations</span>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            padding: '6px 14px', borderRadius: 8, border: 'none',
            background: 'rgba(239,68,68,0.15)', color: '#f87171',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </header>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
        {children}
      </main>
    </div>
  )
}
