'use client'

import { usePathname } from 'next/navigation'

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <header style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🔑</div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Supervisor Panel</span>
          <span style={{ fontSize: 12, color: '#475569', marginInlineStart: 8 }}>Ghabashi Operations</span>
        </div>
      </header>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
        {children}
      </main>
    </div>
  )
}
